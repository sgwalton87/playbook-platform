import { describe, expect, it } from "vitest";
import { getOnboardingDestination, getRoleDefinition, normalizePlaybookRole } from "./registry";

describe("playbook role registry", () => {
  it("keeps district and employer onboarding aligned to their canonical OS routes", () => {
    expect(getRoleDefinition("district").onboarding).toBe(true);
    expect(getRoleDefinition("employer").onboarding).toBe(true);
    expect(getOnboardingDestination("district")).toContain("district");
    expect(getOnboardingDestination("employer")).toContain("employer");
  });

  it("normalizes counselor roles into the educator pathway", () => {
    expect(normalizePlaybookRole("counselor")).toBe("educator");
  });
});
