export const SESSION_INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
export const SESSION_TIMEOUT_WARNING_MS = 60 * 1000;
export const SESSION_ACTIVITY_STORAGE_KEY = "playbook:last-session-activity";

export const SESSION_TIMEOUT_MESSAGE =
  "Your session ended after 5 minutes of inactivity. Log in again to continue securely.";

export function getSessionTimeoutState(
  lastActivityAt: number,
  now: number
): "active" | "warning" | "expired" {
  const remaining = lastActivityAt + SESSION_INACTIVITY_LIMIT_MS - now;

  if (remaining <= 0) return "expired";
  if (remaining <= SESSION_TIMEOUT_WARNING_MS) return "warning";
  return "active";
}

export function getNextSessionCheckDelay(lastActivityAt: number, now: number): number {
  const state = getSessionTimeoutState(lastActivityAt, now);
  if (state === "expired") return 0;

  const deadline =
    state === "active"
      ? lastActivityAt + SESSION_INACTIVITY_LIMIT_MS - SESSION_TIMEOUT_WARNING_MS
      : lastActivityAt + SESSION_INACTIVITY_LIMIT_MS;

  return Math.max(0, deadline - now);
}
