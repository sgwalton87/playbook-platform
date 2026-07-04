export function buildNotificationDigest(input: {
  notifications: any[];
  cadence: "daily" | "weekly";
}) {
  const unread = input.notifications.filter((n) => !n.read);

  const grouped = unread.reduce<Record<string, any[]>>((acc, item) => {
    const key = item.type || "general";
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});

  return {
    cadence: input.cadence,
    totalUnread: unread.length,
    grouped,
    summary: `${unread.length} unread Playbook updates in your ${input.cadence} digest.`,
  };
}
