import { describe, expect, it } from "vitest";
import {
  getNextOnboardingStep,
  getOnboardingValidationError,
} from "@/lib/onboarding/experience";

describe("premium onboarding experience rules", () => {
  it("requires identity before advancing", () => {
    expect(getOnboardingValidationError({ stepId: "identity", form: {} }))
      .toContain("full name and username");
  });

  it("allows optional steps to be skipped", () => {
    expect(getOnboardingValidationError({ stepId: "identity", form: {}, skip: true }))
      .toBeNull();
  });

  it("always requires the safety agreement at completion", () => {
    expect(getOnboardingValidationError({
      stepId: "community-safety",
      form: {},
      skip: true,
      isLast: true,
    })).toContain("Community Safety Agreement");
  });

  it("does not advance beyond the final step", () => {
    expect(getNextOnboardingStep(3, 4)).toBe(3);
    expect(getNextOnboardingStep(1, 4)).toBe(2);
  });
});
