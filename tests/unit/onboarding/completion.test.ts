import { describe, expect, it } from "vitest";
import { assertRoleOnboardingCompletionSupported } from "@/lib/onboarding";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("role onboarding submission authority", () => {
  it("permits every registered public role to submit its own onboarding profile", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(assertRoleOnboardingCompletionSupported(role)).toBe(role);
    }
  });

  it("resolves documented aliases without changing the canonical role", () => {
    expect(assertRoleOnboardingCompletionSupported("athlete")).toBe("scholar-athlete");
    expect(assertRoleOnboardingCompletionSupported("tay")).toBe("transition-youth");
    expect(assertRoleOnboardingCompletionSupported("parent")).toBe("family");
    expect(assertRoleOnboardingCompletionSupported("counselor")).toBe("high-school-counselor");
    expect(assertRoleOnboardingCompletionSupported("recruiter")).toBe("college-coach");
  });

  it("fails closed for missing or unknown roles instead of substituting Scholar", () => {
    expect(() => assertRoleOnboardingCompletionSupported("")).toThrow("role is required");
    expect(() => assertRoleOnboardingCompletionSupported("not-a-role")).toThrow("Unsupported Playbook role");
  });
});
