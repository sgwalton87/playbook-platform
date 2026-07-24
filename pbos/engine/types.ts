export type GateStatus = "proposed" | "pending" | "in_progress" | "blocked" | "complete";
export type ExecutionMode = "planning" | "execution" | "audit" | "doctor" | "release" | "ship";
export type ValidationSeverity = "info" | "warning" | "error";
export type { ReleaseEnvironment, ReleaseState, ReleaseTransition } from "../release/state-machine";

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
  defaultCommand: "next";
}

export interface GateDefinition {
  id: string;
  title: string;
  status: GateStatus;
  priority: number;
  dependencies: string[];
  handbook_refs?: string[];
  tasks: string[];
  definition_of_done: string[];
  validation: string[];
  next_gate: string | null;
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
  release: import("../release/state-machine").ReleaseTransition;
}

export interface RuleResult {
  id: string;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
  remediation: string;
  handbookReference: string;
}

export interface PlannerResult {
  selectedGate: GateDefinition | null;
  eligibleGates: GateDefinition[];
  blockedGates: Array<{ gate: GateDefinition; missingDependencies: string[] }>;
  completedGateIds: string[];
  ruleResults: RuleResult[];
}

export interface ValidationResult {
  id: string;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
  remediation: string;
  handbookReference: string;
  command?: string;
}

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
  release?: import("../release/state-machine").ReleaseTransition;
}
