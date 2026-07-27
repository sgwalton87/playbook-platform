import type { CertificationResult } from "../certification";
import type { PBOSRuntimeContext } from "../context";
import type { ApprovedExecutionContract, GovernedValidationResult, ValidationRepositoryEvidence } from "../validation";
import type { PlanningDecision } from "../planner";
import type { GovernedOrchestrationResult, LifecycleStage } from "../orchestrator";
import type { GovernedReleaseDecision } from "../release";

export type AutonomyState =
  | "OBSERVING"
  | "ANALYZING"
  | "RECOMMENDING"
  | "WAITING_FOR_APPROVAL"
  | "EXECUTING_APPROVED_WORK"
  | "VALIDATING"
  | "CERTIFYING"
  | "RELEASING"
  | "BLOCKED";

export interface AutonomyGovernanceState {
  status: "resolved" | "pending" | "conflict" | "rejected";
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  blockers: string[];
  requiredApprovals: string[];
  evidenceReferences: string[];
}

export interface AutonomyEngineOutputs {
  planning?: PlanningDecision;
  execution?: ApprovedExecutionContract;
  validation?: GovernedValidationResult;
  certification?: CertificationResult;
  release?: GovernedReleaseDecision;
}

export interface AutonomyInput {
  runtimeContext: PBOSRuntimeContext | null;
  repositoryState: ValidationRepositoryEvidence;
  lifecycleState: GovernedOrchestrationResult;
  governanceState: AutonomyGovernanceState;
  engineOutputs: AutonomyEngineOutputs;
  observationTimestamp: string;
}

export interface AutonomyObservation {
  observationId: string;
  observationTimestamp: string;
  inputContextDigest: string;
  currentLifecycleStage: LifecycleStage | null;
  completedStages: LifecycleStage[];
  availableNextActions: string[];
  blockedConditions: string[];
  missingEvidence: string[];
  governanceRequirements: string[];
  validationStatus: "PASS" | "FAIL" | "BLOCKED" | "NOT_AVAILABLE";
  releaseStatus: "APPROVED" | "REJECTED" | "BLOCKED" | "NOT_AVAILABLE";
  evidenceReferences: string[];
}

export type AutonomyConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AutonomyRecommendation {
  recommendationId: string;
  observationId: string;
  recommendedAction: string;
  reasoning: string[];
  evidenceReferences: string[];
  impactedSystems: string[];
  requiredApprovals: string[];
  confidenceClassification: AutonomyConfidence;
  blockedConditions: string[];
  advisoryOnly: true;
}

export interface AutonomyApproval {
  status: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface AutonomyTransition {
  from: AutonomyState;
  to: AutonomyState;
  transitionedAt: string;
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface AutonomyMachineState {
  currentState: AutonomyState;
  transitions: AutonomyTransition[];
}

export interface AutonomyDecisionAudit {
  decisionId: string;
  observationTimestamp: string;
  inputContextDigest: string;
  reasoningEvidence: string[];
  recommendation: AutonomyRecommendation;
  approvalState: AutonomyApproval;
  lifecycleStage: LifecycleStage | null;
  resultingAction: string;
  stateTransition: AutonomyTransition;
}

export type AutonomyFailureCode =
  | "INVALID_CONTEXT"
  | "MISSING_AUTHORITY"
  | "GOVERNANCE_CONFLICT"
  | "INVALID_LIFECYCLE"
  | "MISSING_EVIDENCE"
  | "INVALID_TRANSITION"
  | "UNAUTHORIZED_EXECUTION";

export interface AutonomyFailure {
  code: AutonomyFailureCode;
  message: string;
}
