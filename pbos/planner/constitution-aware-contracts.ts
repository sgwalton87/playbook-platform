import type { PBOSRuntimeContext } from "../context";

export type PlanningGateStatus = "proposed" | "ready" | "in_progress" | "blocked" | "complete";

export interface PlanningGate {
  identifier: string;
  objective: string;
  dependencies: string[];
  status: PlanningGateStatus;
  priority: number;
  validationRequirements: string[];
  authorityReferences: string[];
  evidenceReferences: string[];
}

export interface RepositoryValidationResult {
  identifier: string;
  status: "passed" | "failed" | "pending";
  evidence: string[];
}

export interface PlanningRepositoryState {
  branch: string;
  commit: string;
  workingTree: "clean" | "dirty";
  validationResults: RepositoryValidationResult[];
}

export interface PlanningInput {
  runtimeContext: PBOSRuntimeContext | null;
  gates: PlanningGate[];
  repository: PlanningRepositoryState;
}

export type ConfidenceClassification = "HIGH" | "MEDIUM" | "LOW";

export interface PlanningDecision {
  selectedGate: string | null;
  reasoning: string[];
  satisfiedDependencies: string[];
  blockingDependencies: string[];
  requiredValidations: string[];
  confidenceClassification: ConfidenceClassification;
  evidenceReferences: string[];
}

export type PlanningFailureCode =
  | "MISSING_CONTEXT"
  | "INVALID_CONTEXT"
  | "UNRESOLVED_GOVERNANCE"
  | "CONFLICTING_GATE"
  | "INVALID_REPOSITORY_STATE";

export interface PlanningFailure {
  code: PlanningFailureCode;
  artifact: string;
  message: string;
}
