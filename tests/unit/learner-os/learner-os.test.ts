import { describe, expect, it } from "vitest";
import {
  buildLearnerOSProjection,
  getLearnerOSDefinition,
  SCHOLAR_BASELINE_MODULES,
  type LearnerOSRole,
} from "@/lib/learner-os";

const roles: LearnerOSRole[] = [
  "scholar",
  "scholar-athlete",
  "transition-youth",
  "athlete-abroad",
];

describe("learner OS projections", () => {
  it.each(roles)("provides a distinct complete module map for %s", (role) => {
    const definition = getLearnerOSDefinition(role);
    expect(definition.label).toBeTruthy();
    expect(definition.headline).toBeTruthy();
    expect(definition.modules.length).toBeGreaterThanOrEqual(4);
    expect(new Set(definition.modules.map((module) => module.title)).size).toBe(
      definition.modules.length,
    );
  });

  it.each(roles)(
    "gives %s every Scholar OS baseline module before adding unique capabilities",
    (role) => {
      const routes = getLearnerOSDefinition(role).modules.map((module) => module.href);

      for (const capability of SCHOLAR_BASELINE_MODULES) {
        expect(routes).toContain(capability.href);
      }
    },
  );

  it.each(roles.filter((role) => role !== "scholar"))(
    "adds unique capabilities to the Scholar baseline for %s",
    (role) => {
      expect(getLearnerOSDefinition(role).modules.length).toBeGreaterThan(
        SCHOLAR_BASELINE_MODULES.length,
      );
    },
  );

  it("projects canonical onboarding data without creating another learner record", () => {
    const profile = {
      full_name: "Jordan Lee",
      school: "Playbook High",
      grade: "11",
      onboarding_data: {
        primary_sport: "Basketball",
        position: "Guard",
        current_team: "Playbook High",
        target_division: "NCAA D2",
        support_network: [
          { label: "Coach", email: "coach@example.com" },
          { label: "Mentor", email: "mentor@example.com" },
        ],
      },
    };

    const projection = buildLearnerOSProjection("scholar-athlete", profile);
    expect(projection.displayName).toBe("Jordan Lee");
    expect(projection.supportCount).toBe(2);
    expect(projection.readiness).toBeGreaterThan(0);
  });

  it("uses role-specific readiness fields", () => {
    const abroad = buildLearnerOSProjection("athlete-abroad", {
      onboarding_data: {
        target_countries: ["Spain"],
        abroad_pathway_goal: "University + sport",
        passport_status: "Valid passport",
        desired_start_window: "Fall 2027",
      },
    });
    const scholar = buildLearnerOSProjection("scholar", {});

    expect(abroad.readiness).toBeGreaterThan(scholar.readiness);
  });
});
