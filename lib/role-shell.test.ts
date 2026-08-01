import { describe, expect, it } from "vitest";
import { getRoleContentSurface, getRoleNavigationItems, getRoleShellState, getRoleShellStateFromContext, resolveRoleFromPathname } from "./role-shell";

describe("role-shell", () => {
  it("resolves mentor routes to the mentor role shell", () => {
    expect(resolveRoleFromPathname("/mentor-os")).toBe("mentor");
  });

  it("resolves family routes to the family role shell", () => {
    expect(resolveRoleFromPathname("/family-os")).toBe("family");
  });

  it("returns navigation items that include notifications and settings for scholars", () => {
    const items = getRoleNavigationItems("scholar");
    expect(items.some((item) => item.href === "/dashboard")).toBe(true);
    expect(items.some((item) => item.href === "/notifications")).toBe(true);
    expect(items.some((item) => item.href === "/settings")).toBe(true);
  });

  it("filters navigation by role permissions for founder/admin surfaces", () => {
    const items = getRoleNavigationItems("founder", ["view_cohort", "view_equity_metrics"]);
    expect(items.some((item) => item.href === "/admin")).toBe(true);
    expect(items.some((item) => item.href === "/permissions")).toBe(true);
  });

  it("returns notification and evidence state for the active role shell", () => {
    const state = getRoleShellState("mentor");
    expect(state.notificationCount).toBeGreaterThan(0);
    expect(state.settingsStatus).toBe("configured");
    expect(state.evidenceStatus).toBe("ready");
  });

  it("builds shell state from profile and route context", () => {
    const state = getRoleShellStateFromContext({
      role: "founder",
      profileMode: "founder",
      pathname: "/admin",
      permissions: ["view_cohort", "view_equity_metrics"],
    });

    expect(state.role).toBe("founder");
    expect(state.notificationCount).toBeGreaterThan(0);
    expect(state.permissions).toContain("view_equity_metrics");
  });

  it("returns a role-aware content surface with evidence traceability", () => {
    const surface = getRoleContentSurface("mentor", ["support_tasks", "recommend_actions"], "/mentor-os");

    expect(surface.title).toContain("Mentor");
    expect(surface.highlights.length).toBeGreaterThan(0);
    expect(surface.evidence.some((item) => item.label === "Student check-in")).toBe(true);
  });
});
