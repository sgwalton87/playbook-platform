import { describe, expect, it } from "vitest";
import { selectNextGate } from "./planner";
import type { EngineState, GateDefinition, PbosConfig } from "./types";

const config: PbosConfig = {
  version: "3.0.0",
  defaultMode: "planning",
  supportedModes: ["planning", "execution", "audit", "doctor", "release", "ship"],
  handbook: {
    implementationTruth: "docs/MASTER_CHECKLIST.md",
    releasePolicy: "docs/RELEASE_PROCESS.md",
    sprintSequencing: "docs/auto_sprint.md",
    historyDirectory: "docs/HISTORY",
    ledgerDirectory: "docs/LEDGER",
    futureDirection: "docs/ROADMAP.md",
  },
  gatesDirectory: "pbos/gates",
  reportsDirectory: "docs/release-evidence",
  stateFile: "pbos/state/engine-state.json",
  promptsManifest: "pbos/prompts/manifest.json",
  defaultCommand: "next",
};

const state: EngineState = {
  currentGate: null,
  completedGates: [],
  failedGates: [],
  blockedGates: [],
  blockedBy: [],
  lastRun: null,
  handbookVersion: "2026-07-24",
  validationHash: null,
  configurationHash: null,
  futureCompatibility: [],
  engineVersion: "3.0.0",
  resumeToken: "test-token",
  executionMode: "planning",
  release: {
    currentState: "PROMOTION_PENDING",
    previousState: "ENGINEERING_APPROVED",
    transitionTimestamp: "2026-07-24T00:00:00.000Z",
    transitionReason: "Test promotion pending.",
    environment: {
      name: "sandbox",
      gitRemoteAvailable: false,
      gitCredentialsAvailable: false,
      repositoryWritable: true,
      pullRequestPossible: false,
      tagCreationPossible: false,
    },
    blockingConditions: ["Git remote unavailable"],
  },
};

const gate = (overrides: Partial<GateDefinition> & Pick<GateDefinition, "id" | "priority">): GateDefinition => ({
  title: overrides.id,
  status: "pending",
  dependencies: [],
  tasks: ["Plan one safe sprint."],
  definition_of_done: ["Report generated."],
  validation: ["docs"],
  next_gate: null,
  ...overrides,
});

describe("PBOS planner", () => {
  it("selects the highest-priority eligible gate", () => {
    const result = selectNextGate([
      gate({ id: "PBOS-LOW-001", priority: 10 }),
      gate({ id: "PBOS-HIGH-001", priority: 100 }),
    ], config, state);

    expect(result.selectedGate?.id).toBe("PBOS-HIGH-001");
  });

  it("never skips incomplete prerequisites", () => {
    const result = selectNextGate([
      gate({ id: "PBOS-FIRST-001", priority: 50, status: "in_progress" }),
      gate({ id: "PBOS-SECOND-001", priority: 100, dependencies: ["PBOS-FIRST-001"] }),
    ], config, state);

    expect(result.selectedGate?.id).toBe("PBOS-FIRST-001");
    expect(result.blockedGates[0]?.gate.id).toBe("PBOS-SECOND-001");
  });

  it("unblocks dependent gates only after prerequisites are complete", () => {
    const result = selectNextGate([
      gate({ id: "PBOS-FIRST-001", priority: 50, status: "complete" }),
      gate({ id: "PBOS-SECOND-001", priority: 100, dependencies: ["PBOS-FIRST-001"] }),
    ], config, state);

    expect(result.selectedGate?.id).toBe("PBOS-SECOND-001");
    expect(result.completedGateIds).toContain("PBOS-FIRST-001");
  });

  it("returns structured rule results", () => {
    const result = selectNextGate([gate({ id: "PBOS-GATE-001", priority: 100 })], config, state);

    expect(result.ruleResults.map((rule) => rule.id)).toContain("SingleSprintRule");
    expect(result.ruleResults.every((rule) => typeof rule.handbookReference === "string")).toBe(true);
  });

  it("does not select proposed gates without approval", () => {
    const result = selectNextGate([gate({ id: "PBOS-ENGINE-004", priority: 200, status: "proposed" })], config, state);

    expect(result.selectedGate).toBeNull();
  });
});
