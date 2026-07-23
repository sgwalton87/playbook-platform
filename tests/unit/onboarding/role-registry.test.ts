import { describe, expect, it } from "vitest";
import {
  PUBLIC_ONBOARDING_ROLES,
  ROLE_SELECTION_ROUTE,
  getOnboardingDestination,
  getRoleDestination,
  getSignupDestination,
  normalizePlaybookRole,
} from "@/lib/roles/registry";
import { getOnboardingSteps } from "@/lib/onboarding/roleOnboarding";

describe("canonical Playbook role registry", () => {
  it.each([
    ["athlete", "scholar-athlete"],
    ["parent", "family"],
    ["high-school-coach", "coach"],
    ["recruiter", "college-coach"],
    ["admissions-officer", "college-admissions"],
    ["tay", "transition-youth"],
    ["high-school-counselor", "counselor"],
    ["athletes-abroad", "athlete-abroad"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizePlaybookRole(input)).toBe(expected);
  });

  it("routes every public onboarding role to onboarding first", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(getOnboardingDestination(role)).toBe(`/start?first=1&role=${role}`);
      expect(getRoleDestination(role)).toMatch(/^\//);
    }
  });

  it("gives every public role a complete, bounded onboarding sequence", () => {
    expect(PUBLIC_ONBOARDING_ROLES).toHaveLength(14);

    for (const role of PUBLIC_ONBOARDING_ROLES) {
      const steps = getOnboardingSteps(role);
      const stepIds = steps.map((step) => step.id);

      expect(steps[0].id, `${role} must begin with identity`).toBe("identity");
      expect(steps.at(-1)?.id, `${role} must end with the agreement`).toBe("community-safety");
      expect(new Set(stepIds).size, `${role} step IDs must be unique`).toBe(stepIds.length);
    }
  });

  it.each([
    ["counselor", "counselor-verification"],
    ["employer", "employer-verification"],
    ["district", "district-verification"],
    ["athlete-abroad", "athlete-abroad-enrollment"],
  ])("uses role-specific onboarding for %s", (role, requiredStep) => {
    expect(getOnboardingSteps(role).map((step) => step.id)).toContain(requiredStep);
  });

  it.each([
    "scholar",
    "scholar-athlete",
    "transition-youth",
    "athlete-abroad",
  ])("integrates Starting Five for learner-owned pathway %s", (role) => {
    const stepIds = getOnboardingSteps(role).map((step) => step.id);
    expect(stepIds).toContain("starting-five");
    expect(stepIds).not.toContain("network");
  });

  it.each([
    "scholar",
    "scholar-athlete",
    "transition-youth",
    "athlete-abroad",
  ])("inherits the complete Scholar onboarding baseline for %s", (role) => {
    const stepIds = getOnboardingSteps(role).map((step) => step.id);

    for (const baselineStep of [
      "identity",
      "scholar-support",
      "scholar-academic",
      "scholar-goals",
      "scholar-activities",
      "starting-five",
      "community-safety",
    ]) {
      expect(stepIds).toContain(baselineStep);
    }
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
  ])("keeps invitation-based support network onboarding for %s", (role) => {
    expect(getOnboardingSteps(role).map((step) => step.id)).toContain("network");
  });

  it("uses one canonical support-network field for every role", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      const networkSteps = getOnboardingSteps(role).filter((step) =>
        ["network", "starting-five"].includes(step.id),
      );

      expect(networkSteps).toHaveLength(1);
      expect(networkSteps[0].fields).toEqual([
        expect.objectContaining({ key: "support_network", type: "support-network" }),
      ]);
    }
  });

  it("routes coaches to the institutional support OS instead of Mentor OS", () => {
    expect(getRoleDestination("coach")).toBe("/educator-os");
  });

  it("carries a selected role into account creation", () => {
    expect(getSignupDestination("college-coach"))
      .toBe("/login?mode=signup&role=college-coach");
  });

  it("uses role selection as the public signup entry point", () => {
    expect(ROLE_SELECTION_ROUTE).toBe("/role-select");
  });
});
