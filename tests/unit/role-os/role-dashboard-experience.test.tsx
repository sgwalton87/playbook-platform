import { describe, expect, it } from "vitest";
import { getAllRoleOS, getRoleOS } from "@/lib/role-os";
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";

describe("Role Dashboard Experiences", () => {
  it("includes seven role operating systems including Mentor OS", () => {
    expect(getAllRoleOS().length).toBe(7);
    expect(getRoleOS("mentor").title).toBe("Mentor OS");
  });

  it("returns role-specific dashboard data", () => {
    expect(getRoleDashboard("family").question).toContain("support");
    expect(getRoleDashboard("educator").question).toContain("Who needs");
    expect(getRoleDashboard("mentor").question).toContain("helping");
  });

  it("shared role dashboard component is defined", () => {
    expect(RoleDashboardExperience).toBeTruthy();
  });
});
