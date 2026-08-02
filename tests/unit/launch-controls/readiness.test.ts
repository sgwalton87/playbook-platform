import { describe, expect, it } from "vitest";
import { evaluateLaunchReadiness, LAUNCH_GATES } from "@/lib/launch-controls";
describe("launch readiness", () => {
  it("fails closed when evidence is missing", () => { const result = evaluateLaunchReadiness([]); expect(result.ready).toBe(false); expect(result.blocking).toEqual(LAUNCH_GATES); });
  it("passes only with evidence for every gate", () => { const result = evaluateLaunchReadiness(LAUNCH_GATES.map((gate) => ({ gate, state: "pass" as const, evidence: "ci://run" }))); expect(result.ready).toBe(true); expect(result.blocking).toEqual([]); });
});
