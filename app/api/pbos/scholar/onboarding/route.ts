import { NextRequest, NextResponse } from "next/server";
import {
  getRoleOnboardingCompletionContract,
  normalizeOnboardingRole,
} from "@/lib/onboarding";
import { ScholarOnboardingService, type SupportedScholarRecordRole } from "@/lib/pbos/scholar-onboarding-service";
import { requireUser } from "@/lib/supabase/server";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected server configuration: " + name);
  return value;
}

function approvalsFor(role: SupportedScholarRecordRole) {
  if (role === "SCHOLAR_ATHLETE") {
    return {
      identityApprovalId: required("PBOS_SCHOLAR_ATHLETE_IDENTITY_APPROVAL_ID"),
      exchangeApprovalId: required("PBOS_SCHOLAR_ATHLETE_EXCHANGE_APPROVAL_ID"),
    };
  }
  if (role === "TRANSITION_YOUTH") {
    return {
      identityApprovalId: required("PBOS_TRANSITION_YOUTH_IDENTITY_APPROVAL_ID"),
      exchangeApprovalId: required("PBOS_TRANSITION_YOUTH_EXCHANGE_APPROVAL_ID"),
    };
  }
  return {
    identityApprovalId: required("PBOS_SCHOLAR_IDENTITY_APPROVAL_ID"),
    exchangeApprovalId: required("PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID"),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const profileResult = await supabase
      .from("profiles")
      .select("role,profile_mode,onboarding_completed,verification_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileResult.error) throw new Error(profileResult.error.message);
    if (!profileResult.data) {
      return NextResponse.json({ error: "A durable Playbook profile is required." }, { status: 409 });
    }

    const normalizedRole = normalizeOnboardingRole(
      profileResult.data.profile_mode ?? profileResult.data.role
    );
    const contract = getRoleOnboardingCompletionContract(normalizedRole);

    // Compatibility gateway: the existing onboarding client still posts here.
    // Non-learner roles are never passed into the Scholar Record service; they
    // submit their own profile and enter their own OS in a restricted state.
    if (contract.state !== "implemented") {
      if (!profileResult.data.onboarding_completed) {
        return NextResponse.json(
          { error: `${contract.role} must finish its role-specific onboarding form before completion can be submitted.` },
          { status: 409 }
        );
      }

      if (profileResult.data.verification_status !== "approved") {
        const pending = await supabase
          .from("profiles")
          .update({ verification_status: "pending" })
          .eq("id", user.id)
          .eq("profile_mode", normalizedRole);
        if (pending.error) throw new Error(pending.error.message);
      }

      return NextResponse.json(
        {
          ok: true,
          role: contract.role,
          adapter: contract.adapter,
          onboardingSubmitted: true,
          activationState: contract.state,
          requirement: contract.requirement,
          destination: contract.destination,
          message: `${contract.role} onboarding is complete. Role authority remains fail-closed until its independent activation requirement is satisfied.`,
        },
        { status: 202 }
      );
    }

    const pbosRole: SupportedScholarRecordRole = normalizedRole === "scholar-athlete"
      ? "SCHOLAR_ATHLETE"
      : normalizedRole === "transition-youth"
        ? "TRANSITION_YOUTH"
        : "SCHOLAR";

    if (pbosRole === "SCHOLAR_ATHLETE") {
      const athlete = await supabase
        .from("athlete_profiles")
        .select("scholar_id")
        .eq("scholar_id", user.id)
        .maybeSingle();
      if (athlete.error) throw new Error(athlete.error.message);
      if (!athlete.data) {
        return NextResponse.json(
          { error: "Scholar-Athlete completion requires a durable athlete profile." },
          { status: 409 }
        );
      }
    }

    const body = await request.json() as { displayName?: unknown; goalTitle?: unknown };
    const displayName = String(body.displayName ?? "").trim();
    const goalTitle = String(body.goalTitle ?? "").trim();
    if (!displayName || !goalTitle) {
      return NextResponse.json(
        { error: "Display name and Scholar goal are required." },
        { status: 400 }
      );
    }

    const prefix = pbosRole === "SCHOLAR_ATHLETE"
      ? "scholar-athlete-onboarding-"
      : pbosRole === "TRANSITION_YOUTH"
        ? "transition-youth-onboarding-"
        : "scholar-onboarding-";
    const idempotencyKey = prefix + user.id;
    const connector = new PlaybookConnector(
      new PlaybookPbosRuntimeClient(
        new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
          organizationId: required("PBOS_ORGANIZATION_ID"),
          connectorId: required("PBOS_CONNECTOR_ID"),
          keyId: required("PBOS_CONNECTOR_KEY_ID"),
          secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64"),
        })
      )
    );

    const service = new ScholarOnboardingService({
      async persistOnboarding(input) {
        const profile = await supabase
          .from("scholar_profiles")
          .upsert({
            id: input.scholarId,
            display_name: input.displayName,
            role: input.role,
            onboarding_status: "GOALS_CAPTURED",
          }, { onConflict: "id" })
          .select("id")
          .single();
        if (profile.error) throw new Error(profile.error.message);

        const goal = await supabase
          .from("scholar_goals")
          .upsert({
            scholar_id: input.scholarId,
            title: input.goalTitle,
            status: "ACTIVE",
            provenance: input.provenance,
            idempotency_key: input.idempotencyKey,
          }, { onConflict: "idempotency_key" })
          .select("id")
          .single();
        if (goal.error || !goal.data) {
          throw new Error(goal.error?.message ?? "Scholar goal persistence failed.");
        }

        const milestone = await supabase.from("scholar_milestones").upsert({
          scholar_id: input.scholarId,
          goal_id: goal.data.id,
          milestone_type: "ONBOARDING_COMPLETED",
          approval_id: input.approvalId,
          provenance: input.provenance,
          idempotency_key: input.idempotencyKey,
        }, { onConflict: "idempotency_key" });
        if (milestone.error) throw new Error(milestone.error.message);
        return { scholarRecordId: input.scholarId, goalId: goal.data.id as string };
      },
      async persistDashboard(input) {
        const result = await supabase.from("scholar_dashboard_projections").upsert({
          scholar_id: input.scholarId,
          scholar_record_id: input.scholarRecordId,
          goal_id: input.goalId,
          section_ids: input.sectionIds,
          exchange_approval_id: input.exchangeApprovalId,
          provenance: input.provenance,
          idempotency_key: input.idempotencyKey,
        }, { onConflict: "idempotency_key" });
        if (result.error) throw new Error(result.error.message);

        const profile = await supabase
          .from("scholar_profiles")
          .update({ onboarding_status: "DASHBOARD_READY" })
          .eq("id", input.scholarId);
        if (profile.error) throw new Error(profile.error.message);
      },
    }, {
      registerIdentity: userId => connector.registerIdentity(userId, pbosRole),
      async verifyReady(identity, correlationId) {
        const response = await connector.health(
          identity,
          "Verify the certified Scholar runtime before durable onboarding."
        );
        if (!response.success) throw new Error(response.error.message);
        if (response.correlationId !== "playbook-health-" + identity.externalIdentity.externalIdentityId) {
          throw new Error("PBOS Scholar health response correlation mismatch.");
        }
        return [...response.provenance, correlationId];
      },
      async publishOnboarding(identity, scholarRecordId, correlationId) {
        const response = await connector.publishScholarOnboarding(
          identity,
          {
            eventType: "SCHOLAR_ONBOARDING_COMPLETED",
            schemaVersion: "1.0.0",
            scholarRecordId,
          },
          correlationId
        );
        if (!response.success) throw new Error(response.error.message);
        return response.provenance;
      },
      async projectDashboard(identity, scholarRecordId, sectionIds, exchangeApprovalId, correlationId) {
        const response = await connector.projectScholarDashboard(
          identity,
          { schemaVersion: "1.0.0", scholarRecordId, sectionIds },
          exchangeApprovalId,
          correlationId
        );
        if (!response.success) throw new Error(response.error.message);
        return response.provenance;
      },
    });

    const approvals = approvalsFor(pbosRole);
    const output = await service.complete({
      actorId: user.id,
      ownerId: user.id,
      displayName,
      goalTitle,
      role: pbosRole,
      identityApprovalId: approvals.identityApprovalId,
      exchangeApprovalId: approvals.exchangeApprovalId,
      idempotencyKey,
    });
    return NextResponse.json({ ok: true, dashboard: output });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Role onboarding failed." },
      { status: 500 }
    );
  }
}
