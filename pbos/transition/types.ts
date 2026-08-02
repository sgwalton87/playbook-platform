export const TRANSITION_STATES = [
  "DRAFT",
  "PROPOSED",
  "REQUESTER_APPROVED",
  "REVIEWER_APPROVED",
  "CONTEXT_REFRESH_PENDING",
  "CONTEXT_REFRESHED",
  "TRUSTED_CONTEXT_ACTIVE",
  "VALIDATED",
  "COMPLETE",
] as const;

export type TransitionState = (typeof TRANSITION_STATES)[number];

export interface TransitionStateRecord {
  readonly state: TransitionState;
  readonly timestamp: string;
  readonly evidence_identity: string;
}

export interface TransitionProposal {
  readonly proposal_id: string;
  readonly proposal_scope_identity: string;
  readonly repository_identity: string;
  readonly branch_identity: string;
  readonly commit_identity: string;
  readonly inventory_identity: string;
  readonly change_type: "BASELINE_ACTIVATION";
  readonly risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly purpose: string;
  readonly requester_identity: string | null;
  readonly requester_decision: "APPROVED" | null;
  readonly requester_reason: string | null;
  readonly requester_risk_acknowledgment: string | null;
  readonly reviewer_identity: string | null;
  readonly reviewer_decision: "APPROVED" | "REJECTED" | null;
  readonly reviewer_reason: string | null;
  readonly expiration: string | null;
  readonly boundary_identity: string | null;
  readonly launch_approval_identity: string | null;
  readonly context_refresh: "NOT_STARTED" | "PENDING" | "APPLIED" | "NOT_REQUIRED";
  readonly trusted_context_identity: string | null;
  readonly validation: "NOT_STARTED" | "PASS" | "FAIL";
  readonly state: TransitionState;
  readonly state_history: readonly TransitionStateRecord[];
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface TransitionLifecycleHistory {
  readonly owner: "transition-orchestrator";
  readonly latest: TransitionProposal;
  readonly history: readonly TransitionProposal[];
  readonly digest: string;
}
