import { describe, expect, it } from "vitest";
import { assertRoleOnboardingCompletionSupported } from "@/lib/onboarding";

describe("role onboarding completion authority", () => {
  it("permits the connected Scholar golden contract", () => {
    expect(assertRoleOnboardingCompletionSupported("scholar")).toBe("scholar");
  });

  it.each([
    "scholar-athlete",
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
    "transition-youth",
    "district",
    "other",
  ])("keeps %s resumable but fail-closed", (role) => {
    expect(() => assertRoleOnboardingCompletionSupported(role)).toThrow(
      "onboarding is saved but cannot be completed"
    );
  });
});
