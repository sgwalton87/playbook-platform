import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { ApplicationSupportRequestService, SUPPORT_CATEGORIES, type SupportCategory } from "@/lib/pbos/application-support-request";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string { const value = process.env[name]; if (!value) throw new Error("Missing protected server configuration: " + name); return value; }

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const [workspaces, relationships] = await Promise.all([
      supabase.from("application_workspaces").select("id,opportunity_name,status,deadline").eq("scholar_id", user.id).order("created_at", { ascending: false }),
      supabase.from("support_relationships").select("id,supporter_id,supporter_email,supporter_name,relationship,status,permissions")
        .eq("scholar_id", user.id).eq("status", "active").contains("permissions", ["support_tasks"])
    ]);
    if (workspaces.error) throw new Error(workspaces.error.message);
    if (relationships.error) throw new Error(relationships.error.message);
    return NextResponse.json({ workspaces: workspaces.data ?? [], relationships: relationships.data ?? [],
      categories: SUPPORT_CATEGORIES });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Support request context failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { workspaceId?: unknown; relationshipId?: unknown; category?: unknown;
      summary?: unknown; requestId?: unknown };
    const workspaceId = String(body.workspaceId ?? ""); const relationshipId = String(body.relationshipId ?? "");
    const category = String(body.category ?? "") as SupportCategory; const summary = String(body.summary ?? "");
    const requestId = String(body.requestId ?? "");
    if (!requestId.trim()) return NextResponse.json({ error: "A support request id is required." }, { status: 400 });
    const workspace = await supabase.from("application_workspaces").select("id,scholar_id").eq("id", workspaceId)
      .eq("scholar_id", user.id).maybeSingle();
    if (workspace.error) throw new Error(workspace.error.message);
    if (!workspace.data) return NextResponse.json({ error: "Application workspace not found for this Scholar." }, { status: 404 });
    const relationship = await supabase.from("support_relationships")
      .select("id,scholar_id,supporter_id,supporter_email,status,permissions").eq("id", relationshipId)
      .eq("scholar_id", user.id).eq("status", "active").maybeSingle();
    if (relationship.error) throw new Error(relationship.error.message);
    if (!relationship.data) return NextResponse.json({ error: "Authorized support relationship not found." }, { status: 403 });
    const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
      organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
      keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64")
    }));
    const connector = new PlaybookConnector(client);
    const service = new ApplicationSupportRequestService({
      async createRequest(input) {
        const saved = await supabase.from("application_support_requests").upsert({ scholar_id: input.scholarId,
          application_workspace_id: input.workspaceId, support_relationship_id: input.relationshipId,
          category: input.category, summary: input.summary, idempotency_key: input.idempotencyKey,
          provenance: input.provenance, pbos_delivery_state: "PENDING" }, { onConflict: "idempotency_key" }).select("id").single();
        if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Support request persistence failed.");
        return { requestId: saved.data.id as string };
      },
      async markDelivered(input) {
        const updated = await supabase.from("application_support_requests").update({ pbos_delivery_state: "DELIVERED",
          provenance: input.provenance, updated_at: new Date().toISOString() }).eq("id", input.requestId).eq("scholar_id", input.scholarId);
        if (updated.error) throw new Error(updated.error.message);
      }
    }, {
      registerIdentity: userId => connector.registerIdentity(userId, "SCHOLAR"),
      async publishRequest(identity, input) {
        const response = await client.send("PUBLISH_LIFECYCLE_EVENT", { connectorId: "PLAYBOOK-CONNECTOR-001",
          domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001", identityMappingId: identity.mappingId,
          correlationId: input.correlationId, purpose: "Publish an approved application support request.", payload: {
            eventType: "APPLICATION_SUPPORT_REQUESTED", schemaVersion: "1.0.0", requestId: input.requestId,
            applicationWorkspaceId: input.workspaceId, supportRelationshipId: input.relationshipId, category: input.category
          } }, input.correlationId, input.correlationId);
        if (!response.success) throw new Error(response.error.message); return response.provenance;
      }
    });
    const output = await service.request({ actorId: user.id, scholarId: user.id, workspaceId,
      relationship: { relationshipId: relationship.data.id as string, scholarId: relationship.data.scholar_id as string,
        supporterId: relationship.data.supporter_id as string | null, supporterEmail: relationship.data.supporter_email as string,
        status: relationship.data.status as string, permissions: relationship.data.permissions as string[] },
      category, summary, approvalId: required("PBOS_SUPPORT_REQUEST_APPROVAL_ID"),
      idempotencyKey: user.id + ":" + requestId });
    return NextResponse.json({ ok: true, request: output }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Support request failed." }, { status: 500 });
  }
}
