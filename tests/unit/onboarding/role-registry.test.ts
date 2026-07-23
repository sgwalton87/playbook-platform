import { describe, expect, it } from "vitest";
import {
  PUBLIC_ONBOARDING_ROLES,
  getOnboardingDestination,
  getRoleDestination,
  getSignupDestination,
  normalizePlaybookRole,
} from "@/lib/roles/registry";

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

  it("routes coaches to the institutional support OS instead of Mentor OS", () => {
    expect(getRoleDestination("coach")).toBe("/educator-os");
  });

  it("carries a selected role into account creation", () => {
    expect(getSignupDestination("college-coach"))
      .toBe("/login?mode=signup&role=college-coach");
  });
});
