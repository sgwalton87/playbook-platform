export type DevelopmentTrustState =
  | "ACTIVE"
  | "CURRENT"
  | "ADVANCED"
  | "DEVELOPMENT_CHANGES_PENDING"
  | "EXCEPTION_APPROVAL_REQUIRED"
  | "EXPIRED";

export interface DevelopmentTrustAdvancement {
  readonly from_commit: string;
  readonly to_commit: string;
  readonly changed_files: readonly string[];
  readonly context_identity: string;
  readonly evidence_identity: string;
  readonly timestamp: string;
}

export interface DevelopmentTrustLease {
  readonly lease_id: string;
  readonly repository_identity: string;
  readonly remote_identity: string;
  readonly branch_identity: string;
  readonly baseline_commit_identity: string;
  readonly current_commit_identity: string;
  readonly authority_identity: string;
  readonly requester_identity: string;
  readonly reviewer_identity: string;
  readonly protected_scopes: readonly string[];
  readonly issued_at: string;
  readonly expiration: string;
  readonly status: "ACTIVE" | "REVOKED";
  readonly advancements: readonly DevelopmentTrustAdvancement[];
  readonly digest: string;
}

export interface DevelopmentTrustAssessment {
  readonly state: DevelopmentTrustState;
  readonly lease: DevelopmentTrustLease | null;
  readonly changed_files: readonly string[];
  readonly protected_changes: readonly string[];
  readonly findings: readonly string[];
  readonly context_identity: string | null;
}
