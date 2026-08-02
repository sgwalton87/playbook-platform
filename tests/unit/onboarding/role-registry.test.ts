import { describe, expect, it } from "vitest";
import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  getOnboardingDestination,
  getRoleDestination,
  normalizePlaybookRole,
} from "@/lib/roles/registry";
import { ROLE_ONBOARDING } from "@/lib/onboarding/config/roleConfigs";
import { NAVIGATION_ROLES, hasCanonicalRoleNavigation } from "@/lib/navigation";

describe("canonical Playbook role registry", () => {
  it.each([
    ["athlete", "scholar-athlete"],
    ["parent", "family"],
    ["high-school-coach", "coach"],
    ["recruiter", "college-coach"],
    ["admissions-officer", "college-admissions"],
    ["tay", "transition-youth"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizePlaybookRole(input)).toBe(expected);
  });

  it("routes every public onboarding role to onboarding first", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(getOnboardingDestination(role)).toBe(`/start?first=1&role=${role}`);
      expect(getRoleDestination(role)).toMatch(/^\//);
    }
  });

  it("keeps every canonical role in onboarding and shell navigation", () => {
    const canonicalRoles = Object.keys(PLAYBOOK_ROLES).sort();

    expect([...PUBLIC_ONBOARDING_ROLES].sort()).toEqual(canonicalRoles);
    expect(Object.keys(ROLE_ONBOARDING).sort()).toEqual(canonicalRoles);
    expect([...NAVIGATION_ROLES].sort()).toEqual(canonicalRoles);

    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(ROLE_ONBOARDING[role].length).toBeGreaterThan(0);
      expect(hasCanonicalRoleNavigation(role)).toBe(true);
    }
  });

  it("routes coaches to the institutional support OS instead of Mentor OS", () => {
    expect(getRoleDestination("coach")).toBe("/educator-os");
  });
});
