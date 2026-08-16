import { describe, expect, it } from "vitest";
import { PUBLIC_ONBOARDING_ROLES, getRoleDestination } from "@/lib/roles/registry";
import {
  ROLE_ONBOARDING_COMPLETION,
  getRoleOnboardingCompletionContract,
} from "@/lib/onboarding";

describe("independent onboarding completion contracts", () => {
  it("registers every canonical role exactly once", () => {
    expect(Object.keys(ROLE_ONBOARDING_COMPLETION)).toHaveLength(15);
    for (const [role, contract] of Object.entries(ROLE_ONBOARDING_COMPLETION)) {
      expect(contract.role).toBe(role);
      expect(contract.endpoint).toBe(`/api/pbos/onboarding/${role}`);
      expect(contract.destination).toBe(getRoleDestination(role));
      expect(contract.adapter.length).toBeGreaterThan(0);
      expect(contract.requirement.length).toBeGreaterThan(0);
    }
  });

  it("keeps all public role endpoints and OS destinations distinct", () => {
    const endpoints = PUBLIC_ONBOARDING_ROLES.map(
      (role) => getRoleOnboardingCompletionContract(role).endpoint
    );
    const destinations = PUBLIC_ONBOARDING_ROLES.map(
      (role) => getRoleOnboardingCompletionContract(role).destination
    );

    expect(new Set(endpoints).size).toBe(PUBLIC_ONBOARDING_ROLES.length);
    expect(new Set(destinations).size).toBe(PUBLIC_ONBOARDING_ROLES.length);
  });

  it("classifies completion by governed authority state", () => {
    expect(getRoleOnboardingCompletionContract("scholar").state).toBe("implemented");
    expect(getRoleOnboardingCompletionContract("scholar-athlete").state).toBe("implemented");
    expect(getRoleOnboardingCompletionContract("transition-youth").state).toBe("implemented");

    expect(getRoleOnboardingCompletionContract("family").state).toBe("relationship-gated");
    expect(getRoleOnboardingCompletionContract("mentor").state).toBe("relationship-gated");

    for (const role of ["educator", "high-school-counselor", "coach"] as const) {
      expect(getRoleOnboardingCompletionContract(role).state).toBe("verification-gated");
    }

    for (const role of [
      "college-coach",
      "college-admissions",
      "brand-partner",
      "employer",
      "district",
      "athlete-abroad",
      "other",
    ] as const) {
      expect(getRoleOnboardingCompletionContract(role).state).toBe("authority-pending");
    }
  });

  it("never aliases Family or Mentor into Scholar completion", () => {
    expect(getRoleOnboardingCompletionContract("family").adapter).toBe("FAMILY_RELATIONSHIP");
    expect(getRoleOnboardingCompletionContract("mentor").adapter).toBe("MENTOR_VALIDATION");
    expect(getRoleOnboardingCompletionContract("family").destination).toBe("/family-os");
    expect(getRoleOnboardingCompletionContract("mentor").destination).toBe("/mentor-os");
  });

  it("keeps Educator, Counselor, and Coach as independent verification adapters", () => {
    expect(getRoleOnboardingCompletionContract("educator")).toMatchObject({
      adapter: "EDUCATOR_VERIFICATION",
      destination: "/educator-os",
    });
    expect(getRoleOnboardingCompletionContract("high-school-counselor")).toMatchObject({
      adapter: "COUNSELOR_VERIFICATION",
      destination: "/counselor-os",
    });
    expect(getRoleOnboardingCompletionContract("coach")).toMatchObject({
      adapter: "HIGH_SCHOOL_COACH_VERIFICATION",
      destination: "/coach-os",
    });
  });
});
