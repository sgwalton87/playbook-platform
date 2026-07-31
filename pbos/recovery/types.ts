export type PBOSRecoveryPhase =
  | "TRUSTED"
  | "CONTEXT_INVALID"
  | "COMMITTED_CONTEXT_RECONCILIATION_REQUIRED"
  | "CHANGE_BOUNDARY_CREATED"
  | "BOUNDARY_APPROVED"
  | "REFRESH_APPROVED"
  | "TRUST_ACTIVATION_READY";

export type PBOSRecoveryTransition =
  | "NONE"
  | "CHANGE_BOUNDARY_REQUIRED"
  | "COMMITTED_CONTEXT_RECONCILIATION_REQUIRED"
  | "APPROVE_BOUNDARY_REQUIRED"
  | "APPROVE_REFRESH_REQUIRED"
  | "REFRESH_REQUIRED"
  | "CONTEXT_ACTIVATION_REQUIRED";

export interface PBOSRecoveryRepositoryState {
  readonly identity: string;
  readonly branch: string;
  readonly commit: string;
  readonly working_tree: "CLEAN" | "DIRTY";
  readonly artifact_state: "VALID" | "INVALID";
}

export interface PBOSRecoveryContextState {
  readonly reconciliation_state: "VERIFIED" | "REVIEW_REQUIRED" | "REJECTED";
  readonly previous_identity: string | null;
  readonly proposed_identity: string;
  readonly stored_identity: string | null;
  readonly validation: "PASS" | "FAIL";
}

export interface PBOSRecoveryTrustState {
  readonly level: "TRUSTED" | "BLOCKED";
  readonly trusted_context_identity: string | null;
  readonly boundary: "VALID" | "MISSING" | "INVALID";
  readonly launch_approval: "VALID" | "MISSING" | "INVALID";
  readonly refresh_approval: "VALID" | "MISSING" | "INVALID";
}

export interface PBOSRecoveryStep {
  readonly command: string;
  readonly purpose: string;
}

export interface PBOSRecoveryArtifactExpectation {
  readonly path: string;
  readonly owner: string;
  readonly classification: "RUNTIME" | "TRACKED_EVIDENCE";
}

export interface PBOSRecoveryApprovalRequirement {
  readonly transition: string;
  readonly requester_required: boolean;
  readonly independent_reviewer_required: boolean;
}

export interface PBOSRecoveryAssessment {
  readonly assessment_id: string;
  readonly timestamp: string;
  readonly repository_state: PBOSRecoveryRepositoryState;
  readonly context_state: PBOSRecoveryContextState;
  readonly trust_state: PBOSRecoveryTrustState;
  readonly recovery_required: boolean;
  readonly diagnosis: readonly string[];
  readonly current_phase: PBOSRecoveryPhase;
  readonly recommended_transition: PBOSRecoveryTransition;
  readonly required_sequence: readonly PBOSRecoveryStep[];
  readonly expected_artifacts: readonly PBOSRecoveryArtifactExpectation[];
  readonly approval_requirements: readonly PBOSRecoveryApprovalRequirement[];
  readonly validation_commands: readonly string[];
  readonly digest: string;
}

export interface PBOSRecoveryEvidence {
  readonly repository: PBOSRecoveryRepositoryState;
  readonly reconciliation: PBOSRecoveryContextState;
  readonly trusted: boolean;
  readonly trustedContextIdentity: string | null;
  readonly boundary: "VALID" | "MISSING" | "INVALID";
  readonly launchApproval: "VALID" | "MISSING" | "INVALID";
  readonly refreshApproval: "VALID" | "MISSING" | "INVALID";
  readonly refreshApprovalState: "APPROVED" | "REJECTED" | "APPLIED" | null;
  readonly findings: readonly string[];
  readonly sourceChangeCount: number;
  readonly runtimeChangesOnly: boolean;
  readonly trustedCommitIdentity: string | null;
}
