import { describe, expect, it } from "vitest";
import {
  PUBLIC_ONBOARDING_ROLES,
  getOnboardingDestination,
  getRoleDestination,
  normalizePlaybookRole,
} from "@/lib/roles/registry";
import { ROLE_ONBOARDING } from "@/lib/onboarding/config/roleConfigs";

describe("canonical Playbook role registry", () => {
  it.each([
    ["athlete", "scholar-athlete"],
    ["parent", "family"],
    ["high-school-coach", "coach"],
    ["recruiter", "college-coach"],
    ["admissions-officer", "college-admissions"],
    ["tay", "transition-youth"],
    ["counselor", "high-school-counselor"],
    ["international_athlete", "athlete-abroad"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizePlaybookRole(input)).toBe(expected);
  });

  it("routes every public onboarding role to onboarding first", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(getOnboardingDestination(role)).toBe(`/start?first=1&role=${role}`);
      expect(getRoleDestination(role)).toMatch(/^\//);
    }
  });

  it("routes coaches to the institutional support OS instead of Mentor OS", () => {
    expect(getRoleDestination("coach")).toBe("/educator-os");
  });

  it("exposes all fourteen canonical public onboarding pathways", () => {
    expect(PUBLIC_ONBOARDING_ROLES).toHaveLength(14);
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(ROLE_ONBOARDING[role], `${role} must own role-specific onboarding`).toBeDefined();
      expect(ROLE_ONBOARDING[role].length).toBeGreaterThanOrEqual(3);
    }
  });
});
