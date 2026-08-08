import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { normalizeNotificationEvent, notificationAction, notificationMode, notificationPriorityForAttempt, notificationType,
  type GovernedNotificationEvent } from "@/lib/pbos/reliable-notifications";
import { PlaybookIdentityMapper } from "@/pbos/connector/identity-mapper";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string { const value = process.env[name]; if (!value) throw new Error("Missing protected server configuration: " + name); return value; }

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
  return [identity.pbosIdentity.provenance, ...response.provenance, required("PBOS_NOTIFICATION_JOURNEY_APPROVAL_ID")];
}

async function deliver(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], userId: string,
  outbox: { id: string; event_key: string; event_type: string; event_payload: Record<string, unknown>; attempt_count: number }) {
  const event = normalizeNotificationEvent({ ...outbox.event_payload, eventKey: outbox.event_key, type: outbox.event_type });
  const preference = await supabase.from("pbos_notification_preferences").select("mode").eq("owner_id", userId)
    .eq("notification_type", event.type).maybeSingle();
  if (preference.error) throw new Error(preference.error.message);
  if (preference.data?.mode === "muted") {
    const suppressed = await supabase.from("pbos_notification_outbox").update({ state: "SUPPRESSED", processed_at: new Date().toISOString(), last_error: null })
      .eq("id", outbox.id).eq("owner_id", userId); if (suppressed.error) throw new Error(suppressed.error.message);
    return { notification: null, suppressed: true };
  }
  if (["daily_digest", "weekly_digest"].includes(preference.data?.mode ?? "")) {
    const days = preference.data?.mode === "weekly_digest" ? 7 : 1;
    const queued = await supabase.from("pbos_notification_outbox").update({ state: "DIGEST_QUEUED",
      next_attempt_at: new Date(Date.now() + days * 86_400_000).toISOString(), processed_at: null, last_error: null })
      .eq("id", outbox.id).eq("owner_id", userId);
    if (queued.error) throw new Error(queued.error.message);
    return { notification: null, suppressed: false, digestQueued: true, mode: preference.data?.mode };
  }
  const provenance = await publishPbos(userId, event, userId + ":" + event.eventKey);
  const priority = notificationPriorityForAttempt(event.priority, outbox.attempt_count);
  const saved = await supabase.from("notifications").upsert({ user_id: userId, scholar_id: userId, type: event.type,
    title: event.title, body: event.body, href: event.href, priority, read: false, delivery_status: "in_app",
    source_event_key: event.eventKey, provenance }, { onConflict: "user_id,source_event_key" })
    .select("id,user_id,type,title,body,href,priority,read,created_at,source_event_key").single();
  if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Notification persistence failed.");
  const completed = await supabase.from("pbos_notification_outbox").update({ state: "DELIVERED", processed_at: new Date().toISOString(),
    last_error: null, attempt_count: outbox.attempt_count + 1 }).eq("id", outbox.id).eq("owner_id", userId);
  if (completed.error) throw new Error(completed.error.message); return { notification: saved.data, suppressed: false };
}

export async function GET() {
  try { const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const [notifications, preferences, failures] = await Promise.all([
      supabase.from("notifications").select("id,user_id,scholar_id,type,title,body,href,priority,read,created_at,source_event_key")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("pbos_notification_preferences").select("notification_type,mode").eq("owner_id", user.id),
      supabase.from("pbos_notification_outbox").select("id,event_key,event_type,attempt_count,last_error,next_attempt_at")
        .eq("owner_id", user.id).eq("state", "FAILED").order("created_at", { ascending: false })
    ]);
    if (notifications.error) throw new Error(notifications.error.message); if (preferences.error) throw new Error(preferences.error.message);
    if (failures.error) throw new Error(failures.error.message);
    return NextResponse.json({ notifications: notifications.data ?? [], preferences: preferences.data ?? [], failures: failures.data ?? [] });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Notification center failed." }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try { const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    required("PBOS_NOTIFICATION_JOURNEY_APPROVAL_ID"); const event = normalizeNotificationEvent(await request.json() as Record<string, unknown>);
    const existing = await supabase.from("pbos_notification_outbox").select("id,event_key,event_type,event_payload,state,attempt_count")
      .eq("owner_id", user.id).eq("event_key", event.eventKey).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data?.state === "DELIVERED") {
      const notification = await supabase.from("notifications").select("id,user_id,type,title,body,href,priority,read,created_at,source_event_key")
        .eq("user_id", user.id).eq("source_event_key", event.eventKey).single();
      if (notification.error) throw new Error(notification.error.message); return NextResponse.json({ notification: notification.data, idempotent: true });
    }
    if (existing.data?.state === "SUPPRESSED") return NextResponse.json({ notification: null, suppressed: true, idempotent: true });
    if (existing.data?.state === "DIGEST_QUEUED") return NextResponse.json({ notification: null, digestQueued: true, idempotent: true });
    let outbox = existing.data;
    if (!outbox) {
      const created = await supabase.from("pbos_notification_outbox").insert({ owner_id: user.id, event_key: event.eventKey,
        event_type: event.type, event_payload: event, state: "PENDING", attempt_count: 0 })
        .select("id,event_key,event_type,event_payload,state,attempt_count").single();
      if (created.error || !created.data) throw new Error(created.error?.message ?? "Notification outbox persistence failed."); outbox = created.data;
    }
    try { return NextResponse.json(await deliver(supabase, user.id, outbox)); }
    catch (cause) { const detail = cause instanceof Error ? cause.message : "Delivery failed";
      await supabase.from("pbos_notification_outbox").update({ state: "FAILED", attempt_count: outbox.attempt_count + 1,
        last_error: detail.slice(0, 500), next_attempt_at: new Date(Date.now() + Math.min(60_000 * 2 ** outbox.attempt_count, 3_600_000)).toISOString() })
        .eq("id", outbox.id).eq("owner_id", user.id); throw cause; }
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Notification delivery failed." }, { status: 503 }); }
}

export async function PATCH(request: NextRequest) {
  try { const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { action?: unknown; notificationId?: unknown; notificationType?: unknown; mode?: unknown; outboxId?: unknown };
    const action = notificationAction(String(body.action ?? ""));
    if (action === "READ") { const updated = await supabase.from("notifications").update({ read: true, acknowledged_at: new Date().toISOString() })
      .eq("id", String(body.notificationId ?? "")).eq("user_id", user.id); if (updated.error) throw new Error(updated.error.message); }
    if (action === "READ_ALL") { const updated = await supabase.from("notifications").update({ read: true, acknowledged_at: new Date().toISOString() })
      .eq("user_id", user.id).eq("read", false); if (updated.error) throw new Error(updated.error.message); }
    if (action === "PREFERENCE") { const type = notificationType(String(body.notificationType ?? "")); const mode = notificationMode(String(body.mode ?? ""));
      const updated = await supabase.from("pbos_notification_preferences").upsert({ owner_id: user.id, notification_type: type, mode,
        updated_at: new Date().toISOString() }, { onConflict: "owner_id,notification_type" }); if (updated.error) throw new Error(updated.error.message); }
    if (action === "RETRY") { const found = await supabase.from("pbos_notification_outbox").select("id,event_key,event_type,event_payload,attempt_count")
      .eq("id", String(body.outboxId ?? "")).eq("owner_id", user.id).eq("state", "FAILED").maybeSingle();
      if (found.error) throw new Error(found.error.message); if (!found.data) return NextResponse.json({ error: "Retryable outbox item not found." }, { status: 404 });
      return NextResponse.json(await deliver(supabase, user.id, found.data)); }
    return NextResponse.json({ ok: true, action });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Notification action failed." }, { status: 400 }); }
}
