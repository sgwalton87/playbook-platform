import { describe, expect, it } from "vitest";
import { assessPlatformReadiness, buildPlatformRegistry, validatePlatformRegistry } from "../../../pbos/platform-registry";

describe("canonical platform registry", () => {
  it("validates ownership, evidence, dependencies, and definitions of done", () => {
    const result = validatePlatformRegistry();
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.counts.ROUTE).toBeGreaterThan(90);
    expect(result.counts.API).toBeGreaterThan(40);
    expect(result.counts.OPERATING_SYSTEM).toBe(10);
  });

  it("keeps canonical identities distinct", () => {
    const ids = new Set(buildPlatformRegistry().resources.map(({ id }) => id));
    expect(ids.has("ROLE:COUNSELOR")).toBe(true);
    expect(ids.has("ROLE:ADMINISTRATOR")).toBe(true);
    expect(ids.has("ROLE:FINANCIAL_ADVISOR")).toBe(true);
    expect(ids.has("ENTITY:ATHLETE_RECORD")).toBe(true);
  });

  it("reports blockers and does not fabricate production readiness", () => {
    const assessment = assessPlatformReadiness();
    expect(assessment.production_readiness_percent).toBeLessThan(100);
    expect(assessment.blocking_dependencies).toContain("CONTROL:RECOVERY");
    expect(assessment.recommended_next_mission).toBe("CONTROL:RECOVERY");
  });
});
