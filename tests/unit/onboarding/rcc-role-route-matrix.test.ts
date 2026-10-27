import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { PLAYBOOK_ROLES, PUBLIC_ONBOARDING_ROLES, requirePlaybookRole, getRoleDestination } from "@/lib/roles/registry";

describe("RCC-OS-014: all 15 synthetic role journeys have distinct OS routes", () => {
  it("registers exactly 15 public onboarding roles with no shared OS destinations", () => {
    expect(PUBLIC_ONBOARDING_ROLES).toHaveLength(15);
    const destinations = PUBLIC_ONBOARDING_ROLES.map(role => PLAYBOOK_ROLES[role].osRoute);
    expect(new Set(destinations).size).toBe(15);
  });

  it.each(PUBLIC_ONBOARDING_ROLES)("%s resolves to an existing role-specific OS page", role => {
    const route = PLAYBOOK_ROLES[role].osRoute;
    expect(getRoleDestination(role)).toBe(route);
    expect(route).toMatch(/^\/[a-z0-9-]+$/);
    expect(existsSync(`app${route}/page.tsx`)).toBe(true);
  });

  it("never redirects Family to Scholar-Athlete or Coach to Mentor", () => {
    expect(getRoleDestination("family")).toBe("/family-os");
    expect(getRoleDestination("scholar-athlete")).toBe("/scholar-athlete-os");
    expect(getRoleDestination("coach")).toBe("/coach-os");
    expect(getRoleDestination("mentor")).toBe("/mentor-os");
  });

  it("rejects ambiguous or missing roles instead of granting Scholar access", () => {
    for (const role of ["", "admin", "partner", "unrecognized-role"]) {
      expect(() => requirePlaybookRole(role)).toThrow();
    }
  });

  it("keeps the disposable account provisioner local-only", () => {
    const provisioner = readFileSync("scripts/qa/provision-role-test-accounts.mjs", "utf8");
    expect(provisioner).toContain('PBOS_ALLOW_SYNTHETIC_AUTH_WRITE');
    expect(provisioner).toContain('localhost');
    expect(provisioner).toContain('127.0.0.1');
    expect(provisioner).toContain('REFUSED: test accounts may only be created against localhost');
    expect(provisioner).toContain('admin.auth.admin.deleteUser(id)');
  });
});
