import type { DecisionRecord } from "../types";

export interface LaunchApprovalRecord {
  readonly approval_id: string;
  readonly requester_identity: string;
  readonly reviewer_identity: string;
  readonly boundary_id: string;
  readonly boundary_digest: string;
  readonly decision: "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED";
  readonly decision_reason: string;
  readonly risk_acknowledgment: string;
  readonly scope_identity: string;
  readonly timestamp: string;
  readonly approval_timestamp: string;
  readonly expiration: string;
  readonly ledger_decision: DecisionRecord;
  readonly digest: string;
}

export interface LaunchApprovalValidation {
  readonly valid: boolean;
  readonly findings: readonly string[];
}

export interface LaunchApprovalHistory {
  readonly owner: "authority-ledger";
  readonly latest: LaunchApprovalRecord;
  readonly history: readonly LaunchApprovalRecord[];
  readonly digest: string;
}
