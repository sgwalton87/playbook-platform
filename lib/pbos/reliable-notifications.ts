export const NOTIFICATION_TYPES = ["message","invitation","shared_action","compass_alert","mail_reply","network_blocker","recommendation"] as const;
export const NOTIFICATION_MODES = ["immediate","daily_digest","weekly_digest","muted"] as const;
export type GovernedNotificationType = typeof NOTIFICATION_TYPES[number];
export type GovernedNotificationMode = typeof NOTIFICATION_MODES[number];
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface GovernedNotificationEvent { eventKey: string; type: GovernedNotificationType; title: string;
  body: string; href: string; priority: NotificationPriority }

export function normalizeNotificationEvent(input: Record<string, unknown>): GovernedNotificationEvent {
  const type = String(input.type ?? "") as GovernedNotificationType;
  const priority = String(input.priority ?? "medium") as NotificationPriority;
  const event = { eventKey: String(input.eventKey ?? "").trim(), type, title: String(input.title ?? "").trim(),
    body: String(input.body ?? "").trim(), href: String(input.href ?? "").trim(), priority };
  if (!event.eventKey || !NOTIFICATION_TYPES.includes(type) || !["low","medium","high","urgent"].includes(priority) ||
      !event.title || !event.body || !event.href.startsWith("/")) throw new Error("Notification event is invalid.");
  if (event.title.length > 160 || event.body.length > 1000 || event.eventKey.length > 200) throw new Error("Notification event exceeds governed limits.");
  return event;
}

export function notificationPriorityForAttempt(priority: NotificationPriority, attemptCount: number): NotificationPriority {
  if (attemptCount >= 3) return "urgent"; if (attemptCount >= 2 && priority !== "urgent") return "high"; return priority;
}

export function notificationAction(value: string): "READ" | "READ_ALL" | "PREFERENCE" | "RETRY" {
  if (!["READ","READ_ALL","PREFERENCE","RETRY"].includes(value)) throw new Error("Notification action is not governed.");
  return value as "READ" | "READ_ALL" | "PREFERENCE" | "RETRY";
}

export function notificationMode(value: string): GovernedNotificationMode {
  if (!NOTIFICATION_MODES.includes(value as GovernedNotificationMode)) throw new Error("Notification preference is invalid.");
  return value as GovernedNotificationMode;
}

export function notificationType(value: string): GovernedNotificationType {
  if (!NOTIFICATION_TYPES.includes(value as GovernedNotificationType)) throw new Error("Notification type is invalid.");
  return value as GovernedNotificationType;
}
