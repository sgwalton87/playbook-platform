import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { ApplicationWorkspaceJourneyService, APPLICATION_TYPES, type ApplicationTaskInput, type ApplicationType } from "@/lib/pbos/application-workspace-journey";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string { const value = process.env[name]; if (!value) throw new Error("Missing protected server configuration: " + name); return value; }
function runtime() { return new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
  organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
  keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64")
})); }

function applicationService(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"]) {
  const client = runtime(); const connector = new PlaybookConnector(client);
  return new ApplicationWorkspaceJourneyService({
    async createPending(input) {
      const record = await supabase.from("application_workspaces").upsert({ scholar_id: input.ownerId,
        opportunity_id: input.opportunityId, opportunity_name: input.opportunityName, opportunity_type: input.opportunityType,
        deadline: input.deadline, status: "building", delivery_state: "PENDING", idempotency_key: input.idempotencyKey,
        provenance: input.provenance }, { onConflict: "scholar_id,idempotency_key" }).select("id").single();
      if (record.error || !record.data) throw new Error(record.error?.message ?? "Application workspace persistence failed.");
      const tasks = await supabase.from("application_workspace_tasks").upsert(input.tasks.map(task => ({ workspace_id: record.data.id,
        scholar_id: input.ownerId, task_key: task.key, title: task.title, due_at: task.dueAt ?? input.deadline,
        status: "TODO", provenance: input.provenance })), { onConflict: "workspace_id,task_key" });
      if (tasks.error) throw new Error(tasks.error.message); return { workspaceId: record.data.id as string };
    },
    async activate(input) {
      const result = await supabase.from("application_workspaces").update({ delivery_state: "DELIVERED",
        provenance: input.provenance, updated_at: new Date().toISOString() }).eq("id", input.workspaceId).eq("scholar_id", input.ownerId);
      if (result.error) throw new Error(result.error.message);
    },
    async transition(input) {
      if (input.action === "APPLICATION_SUBMITTED") {
        const incomplete = await supabase.from("application_workspace_tasks").select("id", { count: "exact", head: true })
          .eq("workspace_id", input.workspaceId).eq("scholar_id", input.ownerId).neq("status", "COMPLETE");
        if (incomplete.error) throw new Error(incomplete.error.message);
        if ((incomplete.count ?? 0) > 0) throw new Error("Complete every required application task before submission.");
        const submitted = await supabase.from("application_workspaces").update({ status: "submitted", updated_at: new Date().toISOString() })
          .eq("id", input.workspaceId).eq("scholar_id", input.ownerId);
        if (submitted.error) throw new Error(submitted.error.message); return { readiness: 100, status: "submitted" as const };
      }
      const task = await supabase.from("application_workspace_tasks").update({ status: input.action === "TASK_COMPLETED" ? "COMPLETE" : "TODO",
        completed_at: input.action === "TASK_COMPLETED" ? new Date().toISOString() : null, provenance: input.provenance })
        .eq("id", input.taskId!).eq("workspace_id", input.workspaceId).eq("scholar_id", input.ownerId).select("id").single();
      if (task.error || !task.data) throw new Error(task.error?.message ?? "Application task was not found.");
      const all = await supabase.from("application_workspace_tasks").select("status").eq("workspace_id", input.workspaceId).eq("scholar_id", input.ownerId);
      if (all.error) throw new Error(all.error.message);
      const readiness = all.data.length === 0 ? 0 : Math.round(all.data.filter(item => item.status === "COMPLETE").length / all.data.length * 100);
      const status = readiness === 100 ? "ready" as const : "building" as const;
      const updated = await supabase.from("application_workspaces").update({ status, updated_at: new Date().toISOString() })
        .eq("id", input.workspaceId).eq("scholar_id", input.ownerId);
      if (updated.error) throw new Error(updated.error.message); return { readiness, status };
    },
    async recordTransition(input) {
      const saved = await supabase.from("application_workspace_events").upsert({ workspace_id: input.workspaceId,
        scholar_id: input.ownerId, event_type: input.action, idempotency_key: input.idempotencyKey,
        delivery_state: "DELIVERED", provenance: input.provenance }, { onConflict: "scholar_id,idempotency_key" });
      if (saved.error) throw new Error(saved.error.message);
    }
  }, {
    registerIdentity: userId => connector.registerIdentity(userId, "SCHOLAR"),
    async publish(identity, input) {
      const response = await client.send("PUBLISH_LIFECYCLE_EVENT", { connectorId: "PLAYBOOK-CONNECTOR-001",
        domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001", identityMappingId: identity.mappingId,
        correlationId: input.correlationId, purpose: "Publish approved application workspace lifecycle evidence.", payload: {
          eventType: input.eventType, schemaVersion: "1.0.0", workspaceId: input.workspaceId,
          opportunityId: input.opportunityId, action: input.action, readiness: input.readiness, status: input.status
        } }, input.correlationId, input.correlationId);
      if (!response.success) throw new Error(response.error.message); return response.provenance;
    }
  });
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const result = await supabase.from("application_workspaces").select("id,opportunity_id,opportunity_name,opportunity_type,deadline,status,delivery_state,created_at,updated_at,application_workspace_tasks(id,title,due_at,status),application_workspace_documents(id,file_name,media_type,size_bytes,created_at)")
      .eq("scholar_id", user.id).order("updated_at", { ascending: false });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ workspaces: result.data ?? [] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load application workspaces." }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { opportunityId?: unknown; opportunityName?: unknown; opportunityType?: unknown;
      deadline?: unknown; tasks?: unknown; requestId?: unknown };
    const opportunityType = String(body.opportunityType ?? "") as ApplicationType;
    if (!(APPLICATION_TYPES as readonly string[]).includes(opportunityType)) return NextResponse.json({ error: "Opportunity type is invalid." }, { status: 400 });
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 20).map((item, index): ApplicationTaskInput => {
      const value = item as { key?: unknown; title?: unknown; dueAt?: unknown }; return { key: String(value.key ?? "task-" + index),
        title: String(value.title ?? ""), dueAt: value.dueAt ? String(value.dueAt) : null };
    }) : undefined;
    const output = await applicationService(supabase).create({ actorId: user.id, ownerId: user.id,
      approvalId: required("PBOS_APPLICATION_JOURNEY_APPROVAL_ID"), opportunityId: String(body.opportunityId ?? ""),
      opportunityName: String(body.opportunityName ?? ""), opportunityType,
      deadline: body.deadline ? String(body.deadline) : null, tasks,
      idempotencyKey: String(body.requestId ?? "application-" + user.id + "-" + String(body.opportunityId ?? "")) });
    return NextResponse.json({ ok: true, workspace: output }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create application workspace." }, { status: 400 }); }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { workspaceId?: unknown; taskId?: unknown; action?: unknown; requestId?: unknown };
    const action = String(body.action ?? "");
    if (!["TASK_COMPLETED", "TASK_REOPENED", "APPLICATION_SUBMITTED"].includes(action)) return NextResponse.json({ error: "Application action is invalid." }, { status: 400 });
    const output = await applicationService(supabase).transition({ actorId: user.id, ownerId: user.id,
      approvalId: required("PBOS_APPLICATION_JOURNEY_APPROVAL_ID"), workspaceId: String(body.workspaceId ?? ""),
      taskId: body.taskId ? String(body.taskId) : undefined,
      action: action as "TASK_COMPLETED" | "TASK_REOPENED" | "APPLICATION_SUBMITTED",
      idempotencyKey: String(body.requestId ?? "application-transition-" + user.id + "-" + Date.now()) });
    return NextResponse.json({ ok: true, workspace: output });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update application workspace." }, { status: 400 }); }
}
