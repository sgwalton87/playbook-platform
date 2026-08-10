import { describe, expect, it } from "vitest";
import {
  getNextSessionCheckDelay,
  getSessionTimeoutState,
  SESSION_INACTIVITY_LIMIT_MS,
  SESSION_TIMEOUT_WARNING_MS,
} from "@/lib/auth/sessionTimeout";

describe("session timeout policy", () => {
  const startedAt = 1_000_000;

  it("keeps an active session until the warning boundary", () => {
    expect(getSessionTimeoutState(startedAt, startedAt)).toBe("active");
    expect(getNextSessionCheckDelay(startedAt, startedAt)).toBe(
      SESSION_INACTIVITY_LIMIT_MS - SESSION_TIMEOUT_WARNING_MS
    );
  });

  it("warns for the final minute and expires at five idle minutes", () => {
    const warningAt = startedAt + SESSION_INACTIVITY_LIMIT_MS - SESSION_TIMEOUT_WARNING_MS;
    expect(getSessionTimeoutState(startedAt, warningAt)).toBe("warning");
    expect(getNextSessionCheckDelay(startedAt, warningAt)).toBe(SESSION_TIMEOUT_WARNING_MS);
    expect(getSessionTimeoutState(startedAt, startedAt + SESSION_INACTIVITY_LIMIT_MS)).toBe("expired");
  });
});
