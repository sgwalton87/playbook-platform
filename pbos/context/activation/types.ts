export interface ContextActivationSnapshot {
  readonly context_id: string;
  readonly repository_identity: string;
  readonly commit_identity: string;
  readonly branch_identity: string;
  readonly reconciliation_state: "VERIFIED" | "REVIEW_REQUIRED" | "REJECTED";
  readonly working_tree_clean: boolean;
  readonly artifact_inventory_valid: boolean;
  readonly architecture_inventory_valid: boolean;
  readonly manifest_digest: string;
  readonly artifact_digest: string;
  readonly architecture_digest: string;
  readonly governance_digest: string;
  readonly change_boundary_identity: string;
  readonly change_boundary_valid: boolean;
  readonly launch_approval_identity: string;
  readonly launch_approval_reviewer_identity: string;
  readonly launch_approval_valid: boolean;
  readonly governance_state_valid: boolean;
  readonly digest: string;
}

export interface ContextActivationRequest {
  readonly request_id: string;
  readonly requested_by: string;
  readonly snapshot_digest: string;
  readonly reconciliation_digest: string;
  readonly risk_acknowledgement: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ContextActivationDecision {
  readonly decision_id: string;
  readonly context_id: string;
  readonly reviewer_identity: string;
  readonly decision: "APPROVED" | "REJECTED";
  readonly reason: string;
  readonly evidence_references: readonly string[];
  readonly risk_acknowledgement: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ContextActivationOutcome {
  readonly request_id: string;
  readonly decision: "TRUSTED" | "BLOCKED";
  readonly decided_by: "PBOS-CONTEXT-ACTIVATION";
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface TrustedBuildContext {
  readonly context_id: string;
  readonly repository_identity: string;
  readonly commit_identity: string;
  readonly branch_identity: string;
  readonly manifest_digest: string;
  readonly artifact_digest: string;
  readonly architecture_digest: string;
  readonly governance_digest: string;
  readonly change_boundary_identity: string;
  readonly launch_approval_identity: string;
  readonly activation_decision_id: string;
  readonly created_timestamp: string;
  readonly expiration_timestamp: string;
  readonly created_by: string;
  readonly digest: string;
}

export interface ContextActivationEvidence {
  readonly snapshot: ContextActivationSnapshot;
  readonly request: ContextActivationRequest;
  readonly decision: ContextActivationDecision;
  readonly outcome: ContextActivationOutcome;
  readonly trusted_context: TrustedBuildContext | null;
  readonly digest: string;
}

export interface TrustedBuildContextHistory {
  readonly owner: "context-activation-authority";
  readonly latest: TrustedBuildContext;
  readonly history: readonly TrustedBuildContext[];
  readonly digest: string;
}
