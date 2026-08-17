import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import {
  normalizeNotificationEvent,
  notificationAction,
  notificationMode,
  notificationType,
  type GovernedNotificationEvent,
} from "@/lib/pbos/reliable-notifications";
import { PlaybookIdentityMapper } from "@/pbos/connector/identity-mapper";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected server configuration: " + name);
  return value;
}

async function publishPbos(userId: string, event: GovernedNotificationEvent, correlationId: string) {
  const identity = new PlaybookIdentityMapper().mapSupabaseIdentity(userId, "SCHOLAR");
  const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
    organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
    keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64") }));
  const response = await client.send("PUBLISH_LIFECYCLE_EVENT", { connectorId: "PLAYBOOK-CONNECTOR-001",
    domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001", identityMappingId: identity.mappingId,
    correlationId, purpose: "Publish an approved preference-aware notification.", payload: {
      eventType: "NOTIFICATION_QUEUED", schemaVersion: "1.0.0", notificationType: event.type, eventKey: event.eventKey
    } }, correlationId, correlationId);
  if (!response.success) throw new Error(response.error.message);
}

type RequestSupabase = Awaited<ReturnType<typeof requireUser>>["supabase"];
type Outbox = { id: string; event_key: string; event_type: string; event_payload: Record<string, unknown>; attempt_count: number };

async function transitionOutbox(
  supabase: RequestSupabase,
  outboxId: string,
  state: "FAILED" | "SUPPRESSED" | "DIGEST_QUEUED",
) {
  const transition = await supabase.rpc("transition_notification_outbox", {
    requested_outbox_id: outboxId,
    requested_state: state,
  });
  if (transition.error) throw new Error(transition.error.message);
}

async function deliver(supabase: RequestSupabase, userId: string, outbox: Outbox) {
  const event = normalizeNotificationEvent({ ...outbox.event_payload, eventKey: outbox.event_key, type: outbox.event_type });
  const preference = await supabase.from("pbos_notification_preferences").select("mode").eq("owner_id", userId)
    .eq("notification_type", event.type).maybeSingle();
  if (preference.error) throw new Error(preference.error.message);
  if (preference.data?.mode === "muted") {
    await transitionOutbox(supabase, outbox.id, "SUPPRESSED");
    return { notification: null, suppressed: true };
  }
  if (["daily_digest", "weekly_digest"].includes(preference.data?.mode ?? "")) {
    await transitionOutbox(supabase, outbox.id, "DIGEST_QUEUED");
    return { notification: null, suppressed: false, digestQueued: true, mode: preference.data?.mode };
  }
  await publishPbos(userId, event, userId + ":" + event.eventKey);
  const finalized = await supabase.rpc("finalize_notification_delivery", {
    requested_outbox_id: outbox.id,
  });
  if (finalized.error) throw new Error(finalized.error.message);
  return { notification: finalized.data, suppressed: false };
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const [notifications, preferences, failures] = await Promise.all([
      supabase.from("pbos_notifications").select("id,user_id,scholar_id,type,title,body,href,priority,read,created_at,source_event_key").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("pbos_notification_preferences").select("notification_type,mode").eq("owner_id", user.id),
      supabase.from("pbos_notification_outbox").select("id,event_key,event_type,attempt_count,last_error,next_attempt_at").eq("owner_id", user.id).eq("state", "FAILED").order("created_at", { ascending: false }),
    ]);
    if (notifications.error) throw new Error(notifications.error.message);
    if (preferences.error) throw new Error(preferences.error.message);
    if (failures.error) throw new Error(failures.error.message);
    return NextResponse.json({ notifications: notifications.data ?? [], preferences: preferences.data ?? [], failures: failures.data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Notification center failed." }, { status: 500 });
  }
}

// System notification events are created by governed Playbook workflows.
// Clients cannot author system events. POST only drains a bounded set of already
// trusted PENDING outbox rows owned by the authenticated user through the existing
// preference-aware, PBOS-published delivery path.
export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const pending = await supabase.from("pbos_notification_outbox")
      .select("id,event_key,event_type,event_payload,attempt_count")
      .eq("owner_id", user.id)
      .eq("state", "PENDING")
      .order("created_at", { ascending: true })
      .limit(25);
    if (pending.error) throw new Error(pending.error.message);

    let delivered = 0;
    let suppressed = 0;
    let digestQueued = 0;
    let failed = 0;
    for (const outbox of (pending.data ?? []) as Outbox[]) {
      try {
        const result = await deliver(supabase, user.id, outbox);
        if (result.notification) delivered += 1;
        else if (result.suppressed) suppressed += 1;
        else if (result.digestQueued) digestQueued += 1;
      } catch {
        failed += 1;
        try { await transitionOutbox(supabase, outbox.id, "FAILED"); }
        catch { /* preserve the original delivery failure in the response */ }
      }
    }
    return NextResponse.json({ processed: pending.data?.length ?? 0, delivered, suppressed, digestQueued, failed });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pending notifications could not be processed." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { action?: unknown; notificationId?: unknown; notificationType?: unknown; mode?: unknown; outboxId?: unknown };
    const action = notificationAction(String(body.action ?? ""));
    if (action === "READ" || action === "READ_ALL") {
      const notificationId = action === "READ" ? String(body.notificationId ?? "").trim() : null;
      if (action === "READ" && !notificationId) return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
      const acknowledged = await supabase.rpc("acknowledge_notification", { requested_notification_id: notificationId || null, acknowledge_all: action === "READ_ALL" });
      if (acknowledged.error) throw new Error(acknowledged.error.message);
    }
    if (action === "PREFERENCE") {
      const type = notificationType(String(body.notificationType ?? ""));
      const mode = notificationMode(String(body.mode ?? ""));
      const updated = await supabase.rpc("set_notification_preference", { requested_type: type, requested_mode: mode });
      if (updated.error) throw new Error(updated.error.message);
    }
    if (action === "RETRY") {
      const found = await supabase.from("pbos_notification_outbox").select("id,event_key,event_type,event_payload,attempt_count")
        .eq("id", String(body.outboxId ?? "")).eq("owner_id", user.id).eq("state", "FAILED").maybeSingle();
      if (found.error) throw new Error(found.error.message);
      if (!found.data) return NextResponse.json({ error: "Retryable outbox item not found." }, { status: 404 });
      try { return NextResponse.json(await deliver(supabase, user.id, found.data)); }
      catch (cause) {
        await transitionOutbox(supabase, found.data.id, "FAILED");
        throw cause;
      }
    }
    return NextResponse.json({ ok: true, action });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Notification action failed." }, { status: 400 });
  }
}
