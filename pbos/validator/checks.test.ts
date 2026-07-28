import { describe, expect, it } from "vitest";
import type { ValidationContext } from "./types";
import { runChecks } from "./checks";

function context(status: string): ValidationContext {
  return {
    repository: {},
    planning: {
      selectedGate: {
        id: "PBOS-CONTEXT-001",
        status,
      },
    },
  } as ValidationContext;
}

describe("PBOS runtime gate eligibility validation", () => {
  it("passes an in-progress active sprint", () => {
    const result = runChecks(context("in_progress"));

    expect(
      result.find((check) => check.name === "Planning Eligible")
        ?.status
    ).toBe("PASS");
  });

  it.each(["proposed", "blocked", "complete", "ready"])(
    "rejects %s as an active sprint",
    (status) => {
      const result = runChecks(context(status));

      expect(
        result.find(
          (check) => check.name === "Planning Eligible"
        )?.status
      ).toBe("FAIL");
    }
  );
});
