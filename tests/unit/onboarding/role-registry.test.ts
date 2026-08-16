import { describe, expect, it } from "vitest";
import { getUserPathway } from "@/lib/auth/userPathways";
import {
  PUBLIC_ONBOARDING_ROLES,
  getOnboardingDestination,
  getRoleDestination,
  normalizePlaybookRole,
  requirePlaybookRole,
} from "@/lib/roles/registry";
import {
  getOnboardingCompletionDestination,
  getOnboardingCompletionEndpoint,
  getOnboardingSteps,
  normalizeOnboardingRole,
} from "@/lib/onboarding";
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
    expect(normalizeOnboardingRole(input)).toBe(expected);
    expect(requirePlaybookRole(input)).toBe(expected);
  });

  it("routes every public role through onboarding before its own OS", () => {
    const destinations = new Set<string>();
    const endpoints = new Set<string>();

    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(getOnboardingDestination(role)).toBe(`/start?first=1&role=${role}`);
      expect(getOnboardingCompletionDestination(role)).toBe(getRoleDestination(role));
      expect(getRoleDestination(role)).toMatch(/^\//);

      const endpoint = getOnboardingCompletionEndpoint(role);
      expect(endpoint).toBe(`/api/pbos/onboarding/${role}`);
      endpoints.add(endpoint);
      destinations.add(getRoleDestination(role));
    }

    expect(endpoints.size).toBe(PUBLIC_ONBOARDING_ROLES.length);
    expect(destinations.size).toBe(PUBLIC_ONBOARDING_ROLES.length);
  });

  it("gives every role pathway a first-class OS destination", () => {
    expect(getRoleDestination("scholar")).toBe("/dashboard");
    expect(getRoleDestination("scholar-athlete")).toBe("/scholar-athlete-os");
    expect(getRoleDestination("transition-youth")).toBe("/transition-youth-os");
    expect(getRoleDestination("family")).toBe("/family-os");
    expect(getRoleDestination("mentor")).toBe("/mentor-os");
    expect(getRoleDestination("educator")).toBe("/educator-os");
    expect(getRoleDestination("high-school-counselor")).toBe("/counselor-os");
    expect(getRoleDestination("coach")).toBe("/coach-os");
    expect(getRoleDestination("college-coach")).toBe("/recruiting-os");
    expect(getRoleDestination("college-admissions")).toBe("/admissions-os");
    expect(getRoleDestination("brand-partner")).toBe("/brand-partner-os");
    expect(getRoleDestination("employer")).toBe("/employer-os");
    expect(getRoleDestination("district")).toBe("/district-os");
    expect(getRoleDestination("athlete-abroad")).toBe("/athlete-abroad-os");
    expect(getRoleDestination("other")).toBe("/community-partner-os");
  });

  it("exposes all fourteen canonical public onboarding pathways", () => {
    expect(PUBLIC_ONBOARDING_ROLES).toHaveLength(14);
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(ROLE_ONBOARDING[role], `${role} must own role-specific onboarding`).toBeDefined();
      expect(getOnboardingSteps(role).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps Transition-Aged Youth independent from Scholar-Athlete onboarding", () => {
    const ids = getOnboardingSteps("transition-youth").map((step) => step.id);
    expect(ids).not.toContain("athlete-profile");
    expect(ids).not.toContain("athlete-recruiting");
    expect(ids).toContain("scholar-support");
    expect(ids).toContain("scholar-goals");
  });

  it("declares Mentor as a Scholar-invitation entry pathway", () => {
    const mentor = getUserPathway("mentor");
    expect(mentor.entryMode).toBe("scholar-invitation");
    expect(mentor.short).toContain("Scholar invitation required");
    expect(mentor.nextStep).toContain("Mentor OS");
  });

  it("fails closed for an unknown onboarding role instead of falling back to Scholar", () => {
    expect(() => requirePlaybookRole("totally-unknown-role")).toThrow("Unsupported Playbook role");
    expect(() => getOnboardingSteps("totally-unknown-role")).toThrow("Unsupported Playbook role");
    expect(() => getOnboardingCompletionDestination("totally-unknown-role")).toThrow("Unsupported Playbook role");
    expect(() => getOnboardingCompletionEndpoint("totally-unknown-role")).toThrow("Unsupported Playbook role");
  });
});
