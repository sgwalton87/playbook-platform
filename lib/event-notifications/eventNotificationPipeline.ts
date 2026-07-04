import { buildNotification } from "@/lib/notifications-v2";
import type { IntelligenceEvent } from "@/lib/intelligence-automation";
import {
  getRoleAwareNotificationRule,
  resolveRecipientsFromRelationships,
  shouldDeliverNow,
} from "@/lib/notification-automation";

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
  recipientRole?: string;
  preferences?: Record<string, any>;
}) {
  const role = input.recipientRole || "scholar";

  const rule = getRoleAwareNotificationRule({
    event: {
      type: input.event.type,
      userId: input.recipientUserId,
      scholarId: input.event.scholar_id,
      actorRole: input.event.actor_role || undefined,
      sourceId: input.eventId,
      title: String(input.event.payload.title || ""),
      detail: String(input.event.payload.detail || ""),
    },
    role,
  });

  const notification = buildNotification({
    userId: input.recipientUserId,
    scholarId: input.event.scholar_id,
    type:
      input.event.type === "action.assigned" || input.event.type === "action.completed"
        ? "shared_action"
        : input.event.type === "mail.reply_received"
          ? "mail_reply"
          : input.event.type === "network.blocker_detected"
            ? "network_blocker"
            : input.event.type === "invitation.accepted" || input.event.type === "invitation.pending"
              ? "invitation"
              : input.event.type === "compass.recommendation_ready"
                ? "recommendation"
                : "message",
    title: rule.title,
    body: rule.body,
    href: rule.href,
    priority: rule.priority as any,
    sourceId: input.eventId,
  });

  const deliverNow = shouldDeliverNow({
    type: notification.type as any,
    preferences: input.preferences,
  });

  return {
    user_id: notification.userId,
    scholar_id: notification.scholarId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    href: notification.href,
    priority: notification.priority,
    read: notification.read,
    delivery_status: deliverNow ? "in_app" : "digest_queued",
    source_event_id: input.eventId,
  };
}

export function resolveRecipients(input: {
  scholarId: string;
  relationships?: any[];
  actorRole?: string | null;
}) {
  return resolveRecipientsFromRelationships({
    scholarId: input.scholarId,
    relationships: input.relationships || [],
    includeScholar: true,
  });
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
