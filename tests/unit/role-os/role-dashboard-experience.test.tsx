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
    expect(getRoleDashboard("family").description).toContain("consent-based");
    expect(getRoleDashboard("educator").description).toContain("verified institutional authority");
    expect(getRoleDashboard("mentor").description).toContain("approved mentoring relationship");
  });

  it("does not present fabricated people or metrics as live records", () => {
    const serialized = JSON.stringify([
      getRoleDashboard("family"),
      getRoleDashboard("educator"),
      getRoleDashboard("district"),
      getRoleDashboard("university"),
      getRoleDashboard("employer"),
      getRoleDashboard("mentor"),
    ]);
    expect(serialized).not.toContain("Maya");
    expect(serialized).not.toContain("Kaiser Permanente");
    expect(serialized).not.toContain("$6.3M");
    expect(serialized).toContain("0 connected");
  });

  it("shared role dashboard component is defined", () => {
    expect(RoleDashboardExperience).toBeTruthy();
  });
});
