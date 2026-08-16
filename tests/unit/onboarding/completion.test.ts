import { describe, expect, it } from "vitest";
import { assertRoleOnboardingCompletionSupported } from "@/lib/onboarding";

describe("role onboarding completion authority", () => {
  it("permits the connected Scholar golden contract", () => {
    expect(assertRoleOnboardingCompletionSupported("scholar")).toBe("scholar");
  });

  it("permits Scholar-Athlete only through its governed Scholar Record adapter", () => {
    expect(assertRoleOnboardingCompletionSupported("scholar-athlete")).toBe("scholar-athlete");
    expect(assertRoleOnboardingCompletionSupported("athlete")).toBe("scholar-athlete");
  });

  it("permits Transition-Aged Youth through a self-owned Scholar Record specialization", () => {
    expect(assertRoleOnboardingCompletionSupported("transition-youth")).toBe("transition-youth");
    expect(assertRoleOnboardingCompletionSupported("tay")).toBe("transition-youth");
  });

  it.each([
    "family",
    "educator",
    "high-school-counselor",
    "mentor",
    "coach",
    "college-coach",
    "college-admissions",
    "brand-partner",
    "employer",
    "athlete-abroad",
    "district",
    "other",
  ])("keeps %s resumable but fail-closed", (role) => {
    expect(() => assertRoleOnboardingCompletionSupported(role)).toThrow(
      "onboarding is saved but cannot be completed"
    );
  });
});
