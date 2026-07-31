import { describe, expect, it } from "vitest";
import type { BuildMilestone } from "./types";
import { resolveBuildMilestoneLifecycle } from "./lifecycle";

function milestone(overrides: Partial<BuildMilestone> = {}): BuildMilestone {
  return {
    id: "NEXT-001", name: "Next", type: "MILESTONE", description: "Next work.",
    domain: "features", priority: 90, status: "DEFINED", dependencies: ["PRIOR-001"],
    blocking_dependencies: [], required_artifacts: ["docs/package.md"],
    required_capabilities: ["build"], validation_requirements: ["npm test"],
    risk_level: "YELLOW", approval_level: "HUMAN", completion_definition: ["Validated."],
    evidence_requirements: ["Evidence"], owner: "PBOS", version: "1.0.0",
    outputs: ["app/feature/page.tsx"], ...overrides,
  };
}

describe("build milestone lifecycle resolution", () => {
  it("unlocks defined downstream work after every dependency completes", () => {
    expect(resolveBuildMilestoneLifecycle(
      milestone(), new Set(["PRIOR-001"])
    ).resolved_state).toBe("READY");
  });

  it("keeps downstream work blocked while a dependency is incomplete", () => {
    expect(resolveBuildMilestoneLifecycle(milestone(), new Set()).resolved_state).toBe("BLOCKED");
  });

  it("does not infer readiness for root defined work", () => {
    expect(resolveBuildMilestoneLifecycle(
      milestone({ dependencies: [] }), new Set()
    ).resolved_state).toBe("BLOCKED");
  });

  it("preserves completed advancement history over declared state", () => {
    expect(resolveBuildMilestoneLifecycle(
      milestone({ status: "READY" }), new Set(["NEXT-001"])
    ).resolved_state).toBe("COMPLETED");
  });
});
