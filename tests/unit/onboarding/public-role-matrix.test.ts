import { describe, expect, it } from "vitest";
import {
  getOnboardingCompletionDestination,
  getOnboardingCompletionEndpoint,
} from "@/lib/onboarding";
import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
} from "@/lib/roles/registry";
import { ROLE_ONBOARDING_COMPLETION } from "@/lib/onboarding/completionRegistry";

describe("public role onboarding matrix", () => {
  it("registers exactly fifteen independent public onboarding roles", () => {
    expect(PUBLIC_ONBOARDING_ROLES).toHaveLength(15);
    expect(new Set(PUBLIC_ONBOARDING_ROLES).size).toBe(15);
  });

  it("gives every role one endpoint, one OS destination, and an activation requirement", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      const definition = PLAYBOOK_ROLES[role];
      const contract = ROLE_ONBOARDING_COMPLETION[role];

      expect(contract.role).toBe(role);
      expect(contract.endpoint).toBe(getOnboardingCompletionEndpoint(role));
      expect(contract.destination).toBe(definition.osRoute);
      expect(contract.destination).toBe(getOnboardingCompletionDestination(role));
      expect(contract.adapter.length).toBeGreaterThan(0);
      expect(contract.requirement.length).toBeGreaterThan(0);
    }
  });

  it("never routes a non-Scholar public role to the Scholar dashboard", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      if (role === "scholar") continue;
      expect(ROLE_ONBOARDING_COMPLETION[role].destination).not.toBe("/dashboard");
    }
  });

  it("keeps public endpoints unique", () => {
    const endpoints = PUBLIC_ONBOARDING_ROLES.map(
      role => ROLE_ONBOARDING_COMPLETION[role].endpoint
    );
    expect(new Set(endpoints).size).toBe(endpoints.length);
  });
});
