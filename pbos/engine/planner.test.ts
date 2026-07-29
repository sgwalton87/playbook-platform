import { describe, expect, it } from "vitest";
import { evaluatePlanningRules } from "./planner";
import type {
  EngineState,
  GateDefinition,
  PbosConfig,
} from "./types";
import type { ConstitutionalPlanningReport } from "../planner";

const config: PbosConfig = {
  version: "3.0.0",
  defaultMode: "planning",
  supportedModes: ["planning"],
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

const state = {
  currentGate: "PBOS-NEXT-001",
  failedGates: [],
  blockedGates: [],
  blockedBy: [],
  lastRun: null,
  handbookVersion: "test",
  validationHash: null,
  configurationHash: null,
  futureCompatibility: [],
  engineVersion: "3.0.0",
  resumeToken: "test",
  executionMode: "planning",
  release: {
    currentState: "PROMOTION_COMPLETE",
    previousState: "PROMOTION_PENDING",
    transitionTimestamp: "2026-07-28T00:00:00.000Z",
    transitionReason: "test",
    environment: {
      name: "sandbox",
      gitRemoteAvailable: true,
      gitCredentialsAvailable: true,
      repositoryWritable: true,
      pullRequestPossible: true,
      tagCreationPossible: true,
    },
    blockingConditions: [],
  },
} satisfies EngineState;

const gate: GateDefinition = {
  id: "PBOS-NEXT-001",
  title: "Next",
  description: "Next constitutional gate.",
  status: "in_progress",
  priority: 100,
  lifecycle_stage: 1,
  dependencies: [],
  produces: [],
  requires: [],
  blocking_conditions: [],
  completion_state: "pending",
  handbook_refs: [],
  tasks: [],
  definition_of_done: [],
  validation: ["test"],
  next_gate: null,
};

describe("legacy planner support", () => {
  it("evaluates rules against a supplied constitutional decision", () => {
    const plan = {
      selectedGate: gate,
      eligibleGates: [gate.id],
      blockedGates: [],
    } as unknown as ConstitutionalPlanningReport;

    const results = evaluatePlanningRules({
      gates: [gate],
      config,
      state,
      plan,
    });

    expect(results.map(({ id }) => id)).toContain("SingleSprintRule");
    expect(results.every(({ passed }) => passed)).toBe(true);
  });

  it("does not expose an independent gate selector", async () => {
    const plannerModule = await import("./planner");

    expect("selectNextGate" in plannerModule).toBe(false);
  });
});
