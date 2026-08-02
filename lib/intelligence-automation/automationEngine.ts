import {
  buildNotification,
  notificationHrefForType,
  type PlaybookNotification,
} from "@/lib/notifications-v2";

export type IntelligenceEventType =
  | "message.received"
  | "invitation.accepted"
  | "invitation.pending"
  | "action.assigned"
  | "action.completed"
  | "network.blocker_detected"
  | "compass.recommendation_ready"
  | "mail.reply_received"
  | "verification.requested"
  | "verification.verified"
  | "verification.rejected"
  | "intervention.assigned"
  | "intervention.completed"
  | "opportunity.match_ready"
  | "opportunity.recommended"
  | "opportunity.deadline"
  | "milestone.confirmed"
  | "milestone.portfolio_ready";

export type IntelligenceEvent = {
  type: IntelligenceEventType;
  userId: string;
  scholarId: string;
  actorRole?: string;
  sourceId?: string;
  title?: string;
  detail?: string;
};

export function automateNotificationFromEvent(
  event: IntelligenceEvent
): PlaybookNotification | null {
  switch (event.type) {
    case "verification.requested":
    case "verification.verified":
    case "verification.rejected":
      return buildNotification({ userId: event.userId, scholarId: event.scholarId, type: "verification", title: event.title || "Verification update", body: event.detail || "Review the evidence verification state.", href: notificationHrefForType("verification"), priority: "high", sourceId: event.sourceId });
    case "intervention.assigned":
    case "intervention.completed":
      return buildNotification({ userId: event.userId, scholarId: event.scholarId, type: "intervention", title: event.title || "Intervention update", body: event.detail || "Review the Scholar support action.", href: notificationHrefForType("intervention"), priority: "high", sourceId: event.sourceId });
    case "opportunity.match_ready":
    case "opportunity.recommended":
    case "opportunity.deadline":
      return buildNotification({ userId: event.userId, scholarId: event.scholarId, type: "opportunity", title: event.title || "Opportunity update", body: event.detail || "Review the governed opportunity context.", href: notificationHrefForType("opportunity"), priority: "medium", sourceId: event.sourceId });
    case "milestone.confirmed":
    case "milestone.portfolio_ready":
      return buildNotification({ userId: event.userId, scholarId: event.scholarId, type: "milestone", title: event.title || "Milestone update", body: event.detail || "Review the confirmed Scholar milestone.", href: notificationHrefForType("milestone"), priority: "medium", sourceId: event.sourceId });
    case "message.received":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "message",
        title: event.title || "New message",
        body: event.detail || "You received a new Playbook message.",
        href: "/messages",
        priority: "medium",
        sourceId: event.sourceId,
      });

    case "invitation.accepted":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "invitation",
        title: "Support invitation accepted",
        body:
          event.detail ||
          "A new supporter joined the scholar support network.",
        href: "/scholar-network",
        priority: "medium",
        sourceId: event.sourceId,
      });

    case "action.assigned":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "shared_action",
        title: event.title || "New shared action",
        body: event.detail || "A support action was assigned to you.",
        href: "/messages",
        priority: "high",
        sourceId: event.sourceId,
      });

    case "action.completed":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "shared_action",
        title: event.title || "Shared action completed",
        body:
          event.detail ||
          "A member of the support network completed an action.",
        href: "/scholar-network",
        priority: "medium",
        sourceId: event.sourceId,
      });

    case "network.blocker_detected":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "network_blocker",
        title: event.title || "Network blocker detected",
        body:
          event.detail ||
          "Compass found something slowing scholar momentum.",
        href: "/network-intelligence",
        priority: "high",
        sourceId: event.sourceId,
      });

    case "compass.recommendation_ready":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "recommendation",
        title: event.title || "New Compass recommendation",
        body:
          event.detail ||
          "Compass identified a next best action.",
        href: "/network-intelligence",
        priority: "high",
        sourceId: event.sourceId,
      });

    case "mail.reply_received":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "mail_reply",
        title: event.title || "New email reply",
        body:
          event.detail ||
          "A connected supporter replied by email.",
        href: "/messages",
        priority: "medium",
        sourceId: event.sourceId,
      });

    case "invitation.pending":
      return buildNotification({
        userId: event.userId,
        scholarId: event.scholarId,
        type: "invitation",
        title: event.title || "Invitation still pending",
        body:
          event.detail ||
          "A support invitation has not been accepted yet.",
        href: "/scholar-network",
        priority: "low",
        sourceId: event.sourceId,
      });

    default:
      return null;
  }
}

export function automateNotificationsFromEvents(
  events: IntelligenceEvent[]
) {
  return events
    .map(automateNotificationFromEvent)
    .filter(
      (notification): notification is PlaybookNotification =>
        notification !== null
    );
}
