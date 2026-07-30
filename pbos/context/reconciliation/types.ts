import type { RepositoryContextSnapshot } from "../schema";

export type ContextReconciliationState =
  | "DETECTED"
  | "ANALYZING"
  | "RECONCILING"
  | "REVIEW_REQUIRED"
  | "VERIFIED"
  | "REJECTED";

export type RepositoryRealityRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RepositoryRealityAssessment {
  readonly assessment_id: string;
  readonly repository_identity: string;
  readonly current_commit: string;
  readonly current_branch: string;
  readonly working_tree_state: "CLEAN" | "DIRTY";
  readonly artifact_state: "VALID" | "INVALID";
  readonly manifest_state: "VALID" | "INVALID";
  readonly governance_state: "VALID" | "INVALID";
  readonly architecture_digest: string;
  readonly artifact_digest: string;
  readonly manifest_digest: string | null;
  readonly risk_level: RepositoryRealityRisk;
  readonly recommendation:
    | "ACTIVATION_ELIGIBLE"
    | "HUMAN_REVIEW_REQUIRED"
    | "REJECT";
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ContextDifference {
  readonly code:
    | "MISSING_CONTEXT"
    | "REPOSITORY_IDENTITY"
    | "REPOSITORY_ROOT"
    | "REMOTE_IDENTITY"
    | "BRANCH_IDENTITY"
    | "COMMIT_IDENTITY"
    | "CONTENT_IDENTITY"
    | "RUNTIME_IDENTITY"
    | "ARTIFACT_INVENTORY"
    | "ARTIFACT_IDENTITY";
  readonly previous: string | null;
  readonly current: string | null;
  readonly resolution: string;
}

export interface ContextReconciliationReport {
  readonly reconciliation_id: string;
  readonly state: ContextReconciliationState;
  readonly previous_identity: string | null;
  readonly current_identity: string;
  readonly previous_snapshot: RepositoryContextSnapshot | null;
  readonly current_snapshot: RepositoryContextSnapshot;
  readonly differences: readonly ContextDifference[];
  readonly resolution_actions: readonly string[];
  readonly confidence: number;
  readonly risk_level: RepositoryRealityRisk;
  readonly recommendation:
    | "ACTIVATION_ELIGIBLE"
    | "HUMAN_REVIEW_REQUIRED"
    | "REJECT";
  readonly timestamp: string;
  readonly digest: string;
}
