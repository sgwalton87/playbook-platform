import { describe, expect, it } from "vitest";
import { getNotificationForRole, getRoleNotifications } from "@/lib/action-routing";
import ActionRoutingCenter from "@/components/action-routing/ActionRoutingCenter";

describe("Role OS Action Routing", () => {
  it("returns seven role notifications", () => {
    expect(getRoleNotifications().length).toBe(7);
  });

  it("returns family notification", () => {
    expect(getNotificationForRole("family")?.actionLabel).toContain("family");
  });

  it("component is defined", () => {
    expect(ActionRoutingCenter).toBeTruthy();
  });
});
