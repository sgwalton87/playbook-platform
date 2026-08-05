import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { ScholarOnboardingService } from "@/lib/pbos/scholar-onboarding-service";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string { const value = process.env[name]; if (!value) throw new Error("Missing protected server configuration: " + name); return value; }

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { displayName?: unknown; goalTitle?: unknown };
    const displayName = String(body.displayName ?? "").trim();
    const goalTitle = String(body.goalTitle ?? "").trim();
    if (!displayName || !goalTitle) return NextResponse.json({ error: "Display name and Scholar goal are required." }, { status: 400 });
    const idempotencyKey = "scholar-onboarding-" + user.id;
    const connector = new PlaybookConnector(new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
      organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
      keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64")
    })));
    const service = new ScholarOnboardingService({
      async persistOnboarding(input) {
        const profile = await supabase.from("scholar_profiles").upsert({ id: input.scholarId, display_name: input.displayName,
          role: "SCHOLAR", onboarding_status: "GOALS_CAPTURED" }, { onConflict: "id" }).select("id").single();
        if (profile.error) throw new Error(profile.error.message);
        const goal = await supabase.from("scholar_goals").upsert({ scholar_id: input.scholarId, title: input.goalTitle,
          status: "ACTIVE", provenance: input.provenance, idempotency_key: input.idempotencyKey },
          { onConflict: "idempotency_key" }).select("id").single();
        if (goal.error || !goal.data) throw new Error(goal.error?.message ?? "Scholar goal persistence failed.");
        const milestone = await supabase.from("scholar_milestones").upsert({ scholar_id: input.scholarId, goal_id: goal.data.id,
          milestone_type: "ONBOARDING_COMPLETED", approval_id: input.approvalId, provenance: input.provenance,
          idempotency_key: input.idempotencyKey }, { onConflict: "idempotency_key" });
        if (milestone.error) throw new Error(milestone.error.message);
        return { scholarRecordId: input.scholarId, goalId: goal.data.id as string };
      },
      async persistDashboard(input) {
        const result = await supabase.from("scholar_dashboard_projections").upsert({ scholar_id: input.scholarId,
          scholar_record_id: input.scholarRecordId, goal_id: input.goalId, section_ids: ["identity", "goals"],
          exchange_approval_id: input.exchangeApprovalId, provenance: input.provenance, idempotency_key: input.idempotencyKey },
          { onConflict: "idempotency_key" });
        if (result.error) throw new Error(result.error.message);
        const profile = await supabase.from("scholar_profiles").update({ onboarding_status: "DASHBOARD_READY" }).eq("id", input.scholarId);
        if (profile.error) throw new Error(profile.error.message);
      }
    }, {
      registerIdentity: userId => connector.registerIdentity(userId, "SCHOLAR"),
      async publishOnboarding(identity, scholarRecordId, correlationId) {
        const response = await connector.publishScholarOnboarding(identity, { eventType: "SCHOLAR_ONBOARDING_COMPLETED", schemaVersion: "1.0.0", scholarRecordId }, correlationId);
        if (!response.success) throw new Error(response.error.message); return response.provenance;
      },
      async projectDashboard(identity, scholarRecordId, sectionIds, exchangeApprovalId, correlationId) {
        const response = await connector.projectScholarDashboard(identity, { schemaVersion: "1.0.0", scholarRecordId, sectionIds }, exchangeApprovalId, correlationId);
        if (!response.success) throw new Error(response.error.message); return response.provenance;
      }
    });
    const output = await service.complete({ actorId: user.id, ownerId: user.id, displayName, goalTitle,
      identityApprovalId: required("PBOS_SCHOLAR_IDENTITY_APPROVAL_ID"), exchangeApprovalId: required("PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID"), idempotencyKey });
    return NextResponse.json({ ok: true, dashboard: output });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Scholar onboarding failed." }, { status: 500 });
  }
}
