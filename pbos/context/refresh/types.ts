import type { ContextReconciliationReport } from "../reconciliation";

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
