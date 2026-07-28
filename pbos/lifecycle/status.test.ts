import { describe, expect, it } from "vitest";
import {
  GATE_STATUSES,
  isGateStatus,
  isPlanningEligibleStatus,
} from "./status";

describe("PBOS canonical gate lifecycle statuses", () => {
  it("defines the complete constitutional status set", () => {
    expect(GATE_STATUSES).toEqual([
      "proposed",
      "in_progress",
      "blocked",
      "complete",
    ]);
  });

  it("rejects undocumented statuses", () => {
    expect(isGateStatus("ready")).toBe(false);
    expect(isGateStatus("pending")).toBe(false);
  });

  it("makes only in-progress gates planning eligible", () => {
    expect(isPlanningEligibleStatus("in_progress")).toBe(true);
    expect(isPlanningEligibleStatus("proposed")).toBe(false);
    expect(isPlanningEligibleStatus("blocked")).toBe(false);
    expect(isPlanningEligibleStatus("complete")).toBe(false);
    expect(isPlanningEligibleStatus("ready")).toBe(false);
  });
});
