import { describe, expect, it } from "vitest";
import { PLAYBOOK_ROLES, PUBLIC_ONBOARDING_ROLES, requirePlaybookRole } from "@/lib/roles/registry";
import { getOnboardingSteps, getCanonicalOnboardingRoute, getOnboardingCompletionDestination } from "@/lib/onboarding/engine";

describe("role-to-operating-system experience contract", () => {
  it("Parent/Guardian has a Family-specific flow and dashboard", () => {
    expect(requirePlaybookRole("parent")).toBe("family");
    expect(getOnboardingCompletionDestination("family")).toBe("/family-os");
    const ids = getOnboardingSteps("family").map(x => x.id);
    expect(ids).toContain("family-context");
    expect(ids).not.toContain("athlete-profile");
    expect(ids).not.toContain("brand-context");
  });

  it("Brand Partner gets Brand Partner-specific questions and OS", () => {
    expect(getOnboardingCompletionDestination("brand-partner")).toBe("/brand-partner-os");
    const ids = getOnboardingSteps("brand-partner").map(x => x.id);
    expect(ids).toContain("brand-context");
    expect(ids).not.toContain("family-context");
    expect(ids).not.toContain("athlete-profile");
  });

  it("Scholar, Scholar-Athlete, Family, Brand Partner have distinct destinations", () => {
    const roles = ["scholar", "scholar-athlete", "family", "brand-partner"] as const;
    expect(new Set(roles.map(getOnboardingCompletionDestination)).size).toBe(4);
  });

  it.each(PUBLIC_ONBOARDING_ROLES)("binds %s to its canonical independent OS route", role => {
    expect(getCanonicalOnboardingRoute(role)).toBe(`/start?first=1&role=${role}`);
    expect(getOnboardingCompletionDestination(role)).toBe(PLAYBOOK_ROLES[role].osRoute);
    expect(getOnboardingSteps(role).length).toBeGreaterThan(1);
    expect(PLAYBOOK_ROLES[role].osRoute).toMatch(/^\//);
  });

  it("has no shared destination among distinct canonical roles", () => {
    const destinations = PUBLIC_ONBOARDING_ROLES.map(role => PLAYBOOK_ROLES[role].osRoute);
    expect(new Set(destinations).size).toBe(PUBLIC_ONBOARDING_ROLES.length);
  });
});
