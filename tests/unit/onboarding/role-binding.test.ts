import { describe, expect, it } from "vitest";
import { resolveOnboardingRoleBinding } from "@/lib/onboarding/roleBinding";
import { getOnboardingSteps, getOnboardingCompletionDestination } from "@/lib/onboarding/engine";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("canonical onboarding role boundaries", () => {
  it("keeps a verified Family profile in the Family journey", () => {
    expect(resolveOnboardingRoleBinding({ requestedRole: "family", profileMode: "family" })).toEqual({ ok: true, role: "family" });
    const family = getOnboardingSteps("family");
    expect(family.some(step => step.id === "family-context")).toBe(true);
    expect(family.some(step => step.id === "athlete-profile")).toBe(false);
    expect(getOnboardingCompletionDestination("family")).toBe("/family-os");
  });

  it("rejects trying to run Scholar-Athlete onboarding on a Family account", () => {
    expect(resolveOnboardingRoleBinding({ requestedRole: "scholar-athlete", profileMode: "family" }))
      .toEqual({ ok: false, durableRole: "family" });
  });

  it("accepts a selected signup role before profile persistence", () => {
    expect(resolveOnboardingRoleBinding({ requestedRole: "family" })).toEqual({ ok: true, role: "family" });
  });

  it("never defaults unspecified role to Scholar", () => {
    expect(() => resolveOnboardingRoleBinding({})).toThrow(/verified Playbook pathway/);
  });

  it.each(PUBLIC_ONBOARDING_ROLES)("binds %s to its own registered onboarding and OS", role => {
    expect(resolveOnboardingRoleBinding({ requestedRole: role, profileMode: role })).toEqual({ ok: true, role });
    expect(getOnboardingSteps(role).length).toBeGreaterThan(0);
    expect(getOnboardingCompletionDestination(role)).toMatch(/^\//);
  });
});
