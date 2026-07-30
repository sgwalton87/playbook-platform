import type { ContextReconciliationReport } from "../reconciliation";
import type { ArtifactContext, RepositoryContextSnapshot } from "../schema";

export type ContextRefreshState =
  | "INVALID"
  | "DETECTED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "REFRESHING"
  | "VERIFIED"
  | "TRUSTED";

export interface ContextRefreshApproval {
  readonly request_id: string;
  readonly state: ContextRefreshState;
  readonly reconciliation_digest: string;
  readonly requested_by: string;
  readonly approved_by: string | null;
  readonly approval_evidence: string | null;
  readonly reason: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ContextRefreshAuthorityInput {
  readonly reconciliation: ContextReconciliationReport;
  readonly request: ContextRefreshApproval;
}

export interface ContextRealitySnapshot {
  readonly id: string;
  readonly repository_identity: string;
  readonly commit_identity: string;
  readonly branch: string;
  readonly working_tree_clean: boolean;
  readonly working_tree_content_digest: string;
  readonly artifact_inventory: readonly ArtifactContext[];
  readonly architecture_inventory: readonly string[];
  readonly runtime_inventory: RepositoryContextSnapshot["runtime"];
  readonly governance_state: string;
  readonly captured_at: string;
  readonly digest: string;
}

export interface ContextRefreshRequest {
  readonly id: string;
  readonly requested_by: string;
  readonly reason: string;
  readonly previous_context_identity: string | null;
  readonly candidate_digest: string;
  readonly reconciliation_digest: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ContextRefreshDecision {
  readonly request_id: string;
  readonly decision: "APPROVED" | "DENIED";
  readonly decided_by: string;
  readonly authority: string;
  readonly reason: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ContextRefreshEvidence {
  readonly request: ContextRefreshRequest;
  readonly decision: ContextRefreshDecision;
  readonly reconciliation_digest: string;
  readonly candidate_digest: string;
  readonly valid: boolean;
  readonly findings: readonly string[];
  readonly digest: string;
}
