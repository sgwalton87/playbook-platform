import { describe, expect, it } from "vitest";
import { getFirstLoginTutorial, getTutorialProgress } from "@/lib/tutorial";
import OnboardingTour from "@/components/tutorial/OnboardingTour";
import { getRoleTour } from "@/lib/guided-experience";
import { PLAYBOOK_ROLES, PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("Tutorial", () => {
  it("returns first login steps", () => {
    expect(getFirstLoginTutorial().length).toBeGreaterThan(0);
  });

  it("tracks progress", () => {
    expect(getTutorialProgress(["home"])).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(OnboardingTour).toBeTruthy();
  });

  it("provides a role-aware first-login tutorial for every public role", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      const tour = getRoleTour(role);
      expect(tour).toHaveLength(5);
      expect(tour[0].href).toBe(PLAYBOOK_ROLES[role].osRoute);
      expect(tour.some((step) => step.id === "support-network")).toBe(true);
    }
  });
});
