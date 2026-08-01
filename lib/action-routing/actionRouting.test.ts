import { describe, expect, it } from "vitest";
import { getNotificationForRole, getRoleNotifications } from "./actionRouting";

describe("role action routing", () => {
  it("returns role-aware notifications for support roles", () => {
    const notifications = getRoleNotifications();
    expect(notifications.some((item) => item.role === "educator")).toBe(true);
    expect(getNotificationForRole("educator")?.route).toBe("/educator-os");
  });
});
