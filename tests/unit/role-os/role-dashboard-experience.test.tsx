import { describe, expect, it } from "vitest";
import { getAllRoleOS, getRoleOS } from "@/lib/role-os";
import {
  getRoleDashboard,
  SHARED_ROLE_OS_MODULES,
} from "@/lib/role-os/roleDashboards";
import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";

describe("Role Dashboard Experiences", () => {
  it("includes all 14 role operating systems including Mentor OS", () => {
    expect(getAllRoleOS()).toHaveLength(14);
    expect(getRoleOS("mentor").title).toBe("Mentor OS");
  });

  it("returns role-specific dashboard data", () => {
    expect(getRoleDashboard("family").headline).toContain("Support");
    expect(getRoleDashboard("educator").headline).toContain("learning");
    expect(getRoleDashboard("mentor").headline).toContain("encouragement");
  });

  it.each([
    "family",
    "mentor",
    "educator",
    "counselor",
    "coach",
    "college-coach",
    "college-admissions",
    "brand-partner",
    "employer",
    "district",
  ] as const)("gives %s the shared OS foundation plus unique capabilities", (role) => {
    const dashboard = getRoleDashboard(role);
    const routes = dashboard.modules.map((module) => module.href);

    for (const capability of SHARED_ROLE_OS_MODULES) {
      expect(routes).toContain(capability.href);
    }
    expect(dashboard.modules.length).toBeGreaterThan(SHARED_ROLE_OS_MODULES.length);
  });

  it("shared role dashboard component is defined", () => {
    expect(RoleDashboardExperience).toBeTruthy();
  });
});
