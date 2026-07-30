export type AuthorityDecision = "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED";

export interface ApprovalRecord {
  readonly approval_id: string;
  readonly request_id: string;
  readonly package_id: string;
  readonly package_digest: string;
  readonly context_digest: string;
  readonly requested_by: string;
  readonly approved_by: string;
  readonly authority_type: string;
  readonly risk_level: "GREEN" | "YELLOW" | "RED";
  readonly scope: readonly string[];
  readonly decision: AuthorityDecision;
  readonly timestamp: string;
  readonly expiration: string | null;
  readonly digest: string;
}

export interface DecisionRecord {
  readonly decision_id: string;
  readonly subject_id: string;
  readonly actor_id: string;
  readonly decision: string;
  readonly evidence_ids: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface AuthorizationRecord {
  readonly authorization_id: string;
  readonly approval_id: string;
  readonly package_digest: string;
  readonly context_digest: string;
  readonly valid_from: string;
  readonly valid_until: string | null;
  readonly digest: string;
}

export interface RevocationRecord {
  readonly revocation_id: string;
  readonly authorization_id: string;
  readonly revoked_by: string;
  readonly reason: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface AuthorityLedgerSnapshot {
  readonly approvals: readonly ApprovalRecord[];
  readonly decisions: readonly DecisionRecord[];
  readonly authorizations: readonly AuthorizationRecord[];
  readonly revocations: readonly RevocationRecord[];
  readonly digest: string;
}
