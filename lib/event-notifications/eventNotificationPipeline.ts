import {
  automateNotificationFromEvent,
  type IntelligenceEvent,
} from "@/lib/intelligence-automation";

export function buildPlaybookEvent(input: {
  type: IntelligenceEvent["type"];
  scholarId: string;
  actorId?: string;
  actorRole?: string;
  payload?: Record<string, unknown>;
}) {
  return {
    type: input.type,
    scholar_id: input.scholarId,
    actor_id: input.actorId || null,
    actor_role: input.actorRole || null,
    payload: input.payload || {},
  };
}

export function convertEventToNotification(input: {
  eventId: string;
  event: ReturnType<typeof buildPlaybookEvent>;
  recipientUserId: string;
}) {
  const notification = automateNotificationFromEvent({
    type: input.event.type,
    userId: input.recipientUserId,
    scholarId: input.event.scholar_id,
    actorRole: input.event.actor_role || undefined,
    sourceId: input.eventId,
    title: String(input.event.payload.title || ""),
    detail: String(input.event.payload.detail || ""),
  });

  if (!notification) return null;

  return {
    user_id: notification.userId,
    scholar_id: notification.scholarId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    href: notification.href,
    priority: notification.priority,
    read: notification.read,
    delivery_status: "in_app",
    source_event_id: input.eventId,
  };
}

export function resolveDemoRecipients(input: {
  scholarId: string;
  actorRole?: string | null;
}) {
  return [
    input.scholarId,
    "family-user",
    "mentor-user",
    "educator-user",
  ];
}
