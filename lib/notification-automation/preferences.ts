export type NotificationPreferenceMode = "immediate" | "daily_digest" | "weekly_digest" | "muted";

export function getDefaultNotificationPreferences() {
  return {
    message: "immediate",
    invitation: "immediate",
    shared_action: "immediate",
    compass_alert: "immediate",
    mail_reply: "daily_digest",
    network_blocker: "immediate",
    recommendation: "daily_digest",
  } as const;
}

export function shouldDeliverNow(input: {
  type: keyof ReturnType<typeof getDefaultNotificationPreferences>;
  preferences?: Partial<Record<string, NotificationPreferenceMode>>;
}) {
  const defaults = getDefaultNotificationPreferences();
  const mode = input.preferences?.[input.type] || defaults[input.type];

  return mode === "immediate";
}
