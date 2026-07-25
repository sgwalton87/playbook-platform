import { PBOSWorld } from "../world";
import type { ReleaseTransition } from "../release/state-machine";
import type { GateDefinition } from "../planner/types";

/* -------------------------------------------------------------------------- */
/* Runtime Engine                                                              */
/* -------------------------------------------------------------------------- */

export type EnginePhase =
  | "observe"
  | "understand"
  | "reason"
  | "plan"
  | "validate"
  | "execute"
  | "verify"
  | "learn";

export interface EngineResult {
  success: boolean;
  message: string;
  artifact?: unknown;
}

export interface PBOSEngine {
  id: string;
  name: string;
  phase: EnginePhase;
  dependsOn: string[];
  enabled: boolean;
  run(world: PBOSWorld): Promise<EngineResult> | EngineResult;
}

/* -------------------------------------------------------------------------- */
/* Planning Engine                                                             */
/* -------------------------------------------------------------------------- */

export type ExecutionMode =
  | "planning"
  | "execution"
  | "audit"
  | "doctor"
  | "release"
  | "ship";

export interface PbosConfig {
  version: string;
  defaultMode: ExecutionMode;
  supportedModes: ExecutionMode[];

  handbook: {
    implementationTruth: string;
    releasePolicy: string;
    sprintSequencing: string;
    historyDirectory: string;
    ledgerDirectory: string;
    futureDirection: string;
  };

  gatesDirectory: string;
  reportsDirectory: string;
  stateFile: string;
  promptsManifest: string;
  defaultCommand: string;
}

export interface ValidationResult {
  id: string;
  severity: "info" | "warning" | "error";
  passed: boolean;
  message: string;
  remediation: string;
  handbookReference: string;
  command?: string;
}

export type RuleResult = ValidationResult;

export interface ExecutionReport {
  engineVersion: string;
  executionMode: ExecutionMode;
  selectedGate: string | null;
  completedTasks: string[];
  validationResults: ValidationResult[];
  blockers: string[];
  recommendation: string;
  duration: number;
  timestamp: string;
  release?: ReleaseTransition;
}

export interface EngineState {
  currentGate: string | null;
  completedGates: string[];
  failedGates: string[];
  blockedGates: string[];
  blockedBy: string[];
  lastRun: string | null;
  handbookVersion: string;
  validationHash: string | null;
  configurationHash: string | null;
  futureCompatibility: string[];
  engineVersion: string;
  resumeToken: string;
  executionMode: ExecutionMode;
  release: ReleaseTransition;
}

export interface PlannerResult {
  selectedGate: GateDefinition | null;
  eligibleGates: GateDefinition[];
  blockedGates: Array<{
    gate: GateDefinition;
    missingDependencies: string[];
  }>;
  completedGateIds: string[];
  ruleResults: RuleResult[];
}

export type { GateDefinition };