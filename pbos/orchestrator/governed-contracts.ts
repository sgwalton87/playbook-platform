import type { CertificationResult } from "../certification";
import type { PBOSRuntimeContext } from "../context";
import type { ApprovedExecutionContract, GovernedValidationResult } from "../validation";
import type { PlanningDecision } from "../planner";
import type { GovernedReleaseDecision } from "../release";

export const LIFECYCLE_STAGES = ["CONSTITUTION", "CONTEXT", "PLAN", "EXECUTE", "VALIDATE", "CERTIFY", "RELEASE"] as const;
export type LifecycleStage = typeof LIFECYCLE_STAGES[number];

export interface ConstitutionEvidence {
  status: "VERIFIED" | "BLOCKED";
  sourceDigest: string;
  evidenceReferences: string[];
}

export interface OrchestrationArtifacts {
  constitution?: ConstitutionEvidence;
  context?: PBOSRuntimeContext;
  plan?: PlanningDecision;
  execution?: ApprovedExecutionContract;
  validation?: GovernedValidationResult;
  certification?: CertificationResult;
  release?: GovernedReleaseDecision;
}

export interface OrchestrationGovernanceState {
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  blockers: string[];
  evidenceReferences: string[];
  humanApprovalRequirements: string[];
}

export interface LifecycleTransition {
  from: LifecycleStage | null;
  to: LifecycleStage;
  transitionedAt: string;
  evidenceReferences: string[];
}

export interface GovernedOrchestrationState {
  completedStages: LifecycleStage[];
  transitionHistory: LifecycleTransition[];
}

export interface GovernedOrchestrationInput {
  state: GovernedOrchestrationState;
  artifacts: OrchestrationArtifacts;
  governance: OrchestrationGovernanceState;
  observationTimestamp: string;
}

export interface GovernedOrchestrationResult {
  orchestrationId: string;
  currentLifecycleStage: LifecycleStage | null;
  completedStages: LifecycleStage[];
  nextEligibleStage: LifecycleStage | null;
  blockedStages: LifecycleStage[];
  evidenceReferences: string[];
  stateTransitionHistory: LifecycleTransition[];
  humanApprovalRequirements: string[];
}

export type OrchestrationFailureCode =
  | "SKIPPED_STAGE"
  | "INVALID_TRANSITION"
  | "MISSING_EVIDENCE"
  | "INVALID_CONTEXT"
  | "INVALID_ARTIFACT";

export interface OrchestrationFailure {
  code: OrchestrationFailureCode;
  stage: LifecycleStage;
  message: string;
}
