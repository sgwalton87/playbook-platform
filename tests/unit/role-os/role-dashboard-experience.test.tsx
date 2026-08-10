import { describe, expect, it } from "vitest";
import { assertCanonicalOperatingSystemRegistry, getAllRoleOS, getRoleOS,
  PLAYBOOK_OPERATING_SYSTEMS } from "@/lib/role-os";
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";

describe("Role Dashboard Experiences", () => {
  it("preserves seventeen first-class OS destinations and thirteen shared dashboard definitions", () => {
    expect(() => assertCanonicalOperatingSystemRegistry()).not.toThrow();
    expect(PLAYBOOK_OPERATING_SYSTEMS).toHaveLength(17);
    expect(new Set(PLAYBOOK_OPERATING_SYSTEMS.map((system) => system.route)).size).toBe(17);
    expect(getAllRoleOS().length).toBe(13);
    expect(getRoleOS("mentor").title).toBe("Mentor OS");
  });

  it("returns role-specific dashboard data", () => {
    expect(getRoleDashboard("family").description).toContain("consent-based");
    expect(getRoleDashboard("educator").description).toContain("verified institutional authority");
    expect(getRoleDashboard("mentor").description).toContain("approved mentoring relationship");
    expect(getRoleDashboard("counselor").description).toContain("verified school authority");
    expect(getRoleDashboard("coach").description).toContain("scholar ownership");
    expect(getRoleDashboard("recruiter").description).toContain("consented institutional recruiting authority");
    expect(getRoleDashboard("admissions").description).toContain("institutional admissions");
    expect(getRoleDashboard("transition-youth").description).toContain("independent adulthood");
    expect(getRoleDashboard("community").description).toContain("organization authority");
  });

  it("does not present fabricated people or metrics as live records", () => {
    const serialized = JSON.stringify([
      getRoleDashboard("family"),
      getRoleDashboard("educator"),
      getRoleDashboard("district"),
      getRoleDashboard("university"),
      getRoleDashboard("employer"),
      getRoleDashboard("mentor"),
      getRoleDashboard("counselor"),
      getRoleDashboard("coach"),
      getRoleDashboard("recruiter"),
      getRoleDashboard("admissions"),
      getRoleDashboard("transition-youth"),
      getRoleDashboard("community"),
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
