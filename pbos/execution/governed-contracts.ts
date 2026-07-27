import type { PBOSRuntimeContext } from "../context";
import type { PlanningDecision, PlanningRepositoryState } from "../planner";

export interface ExecutionGateContract {
  identifier: string;
  objective: string;
  status: "ready" | "in_progress" | "blocked" | "complete";
  dependencies: string[];
  requiredActions: string[];
  affectedSystems: string[];
  validationRequirements: string[];
  rollbackExpectations: string[];
  evidenceRequirements: string[];
  completionCriteria: string[];
}

export interface ExecutionGovernanceState {
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  evidenceReferences: string[];
  blockers: string[];
  exclusions: string[];
}

export interface GovernedExecutionInput {
  runtimeContext: PBOSRuntimeContext | null;
  planningDecision: PlanningDecision;
  gate: ExecutionGateContract;
  governance: ExecutionGovernanceState;
  repository: PlanningRepositoryState;
}

export interface ExecutionPlan {
  executionId: string;
  approvedObjective: string;
  sourceGate: string;
  satisfiedDependencies: string[];
  requiredActions: string[];
  affectedSystems: string[];
  constraints: string[];
  requiredValidations: string[];
  rollbackExpectations: string[];
  evidenceRequirements: string[];
  completionCriteria: string[];
}

export type ExecutionFailureCode =
  | "INVALID_PLANNING_DECISION"
  | "INVALID_CONTEXT"
  | "MISSING_APPROVAL"
  | "BLOCKED_EXECUTION"
  | "UNRESOLVED_DEPENDENCY"
  | "INVALID_REPOSITORY_IDENTITY"
  | "MISSING_VALIDATION_REQUIREMENT";

export interface ExecutionFailure {
  code: ExecutionFailureCode;
  artifact: string;
  message: string;
}
