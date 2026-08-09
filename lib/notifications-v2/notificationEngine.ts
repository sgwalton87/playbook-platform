export type NotificationType =
  | "message"
  | "invitation"
  | "shared_action"
  | "compass_alert"
  | "mail_reply"
  | "network_blocker"
  | "recommendation";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type PlaybookNotification = {
  id: string;
  userId: string;
  scholarId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  sourceId?: string | null;
};

export function buildNotification(input: {
  id?: string;
  userId: string;
  scholarId?: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  priority?: NotificationPriority;
  read?: boolean;
  sourceId?: string;
}): PlaybookNotification {
  return {
    id:
      input.id ||
      `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: input.userId,
    scholarId: input.scholarId || null,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
    priority: input.priority || "medium",
    read: input.read || false,
    createdAt: new Date().toISOString(),
    sourceId: input.sourceId || null,
  };
}

export function markNotificationRead(
  notification: PlaybookNotification
): PlaybookNotification {
  return {
    ...notification,
    read: true,
  };
}

export function getUnreadCount(notifications: PlaybookNotification[]) {
  return notifications.filter((notification) => !notification.read).length;
}

export function sortNotifications(
  notifications: PlaybookNotification[]
): PlaybookNotification[] {
  const priorityWeight: Record<NotificationPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;

    const priorityDifference =
      priorityWeight[b.priority] - priorityWeight[a.priority];

    if (priorityDifference !== 0) return priorityDifference;

    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });
}

export function getDemoNotifications(): PlaybookNotification[] {
  return [
    buildNotification({
      id: "notification-message-1",
      userId: "scholar-record",
      scholarId: "scholar-record",
      type: "message",
      title: "New message from your mentor",
      body: "Mock interview this weekend works.",
      href: "/messages/mentor",
      priority: "medium",
    }),
    buildNotification({
      id: "notification-invite-1",
      userId: "scholar-record",
      scholarId: "scholar-record",
      type: "invitation",
      title: "Support invitation accepted",
      body: "A new supporter joined your Playbook network.",
      href: "/scholar-network",
      priority: "medium",
    }),
    buildNotification({
      id: "notification-action-1",
      userId: "scholar-record",
      scholarId: "scholar-record",
      type: "shared_action",
      title: "FAFSA documents need attention",
      body: "Your family support action is still open.",
      href: "/messages/fafsa-action",
      priority: "high",
    }),
    buildNotification({
      id: "notification-compass-1",
      userId: "scholar-record",
      scholarId: "scholar-record",
      type: "compass_alert",
      title: "Compass found a next best action",
      body: "Completing an open support task may improve readiness.",
      href: "/network-intelligence",
      priority: "high",
    }),
    buildNotification({
      id: "notification-mail-1",
      userId: "scholar-record",
      scholarId: "scholar-record",
      type: "mail_reply",
      title: "New email reply in your support network",
      body: "A connected supporter replied by email.",
      href: "/messages/support-network",
      priority: "medium",
    }),
  ];
}
