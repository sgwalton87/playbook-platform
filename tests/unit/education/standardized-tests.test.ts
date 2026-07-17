import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getHighestTestScore,
  normalizeTestPlan,
} from "@/lib/education";

describe(
  "Standardized Test Intelligence",
  () => {
    it(
      "preserves completed attempts, plans, and skip reasons together",
      () => {
        const plan =
          normalizeTestPlan({
            status: "skip",

            completedAttempts: [
              {
                id: "attempt-one",
                date: "2026-03-10",
                score: "1180",
              },
              {
                id: "attempt-two",
                date: "2026-06-08",
                score: "1260",
              },
            ],

            plannedDates: [
              {
                id: "plan-one",
                date: "2026-10-03",
              },
              {
                id: "plan-two",
                date: "2026-12-05",
              },
            ],

            skipReason:
              "I am focusing on the ACT right now.",

            skipSavedAt:
              "2026-07-16T10:00:00.000Z",
          });

        expect(
          plan.completedAttempts
        ).toHaveLength(2);

        expect(
          plan.plannedDates
        ).toHaveLength(2);

        expect(plan.skipReason).toBe(
          "I am focusing on the ACT right now."
        );

        expect(
          getHighestTestScore(plan)
        ).toBe("1260");
      }
    );

    it(
      "migrates old taken records",
      () => {
        const plan =
          normalizeTestPlan({
            status: "taken",
            attempts: [
              {
                id: "old-attempt",
                date: "2026-04-01",
                score: "24",
              },
            ],
          });

        expect(
          plan.completedAttempts
        ).toHaveLength(1);

        expect(
          plan.plannedDates
        ).toEqual([]);
      }
    );

    it(
      "migrates old planned records",
      () => {
        const plan =
          normalizeTestPlan({
            status: "planning",
            attempts: [
              {
                id: "old-plan",
                date: "2026-09-25",
                score: "",
              },
            ],
          });

        expect(
          plan.plannedDates
        ).toHaveLength(1);

        expect(
          plan.completedAttempts
        ).toEqual([]);
      }
    );

    it(
      "preserves spaces in skip explanations",
      () => {
        const plan =
          normalizeTestPlan({
            status: "skip",
            skipReason:
              "I need to focus on the ACT.",
          });

        expect(plan.skipReason).toBe(
          "I need to focus on the ACT."
        );
      }
    );

    it(
      "returns safe defaults",
      () => {
        const plan =
          normalizeTestPlan(null);

        expect(plan.status).toBe("");

        expect(
          plan.completedAttempts
        ).toEqual([]);

        expect(
          plan.plannedDates
        ).toEqual([]);

        expect(plan.skipReason).toBe("");
      }
    );
  }
);
