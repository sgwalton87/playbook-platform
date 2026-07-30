import type { TemporalIdentity } from "../../temporal";

export interface AuthorizationEvent {
  readonly id: string;
  readonly request_id: string;
  readonly actor_id: string;
  readonly decision: "PENDING" | "APPROVED" | "DENIED";
  readonly evidence_ids: readonly string[];
  readonly temporal: TemporalIdentity;
  readonly digest: string;
}

export interface ApprovalRecord {
  readonly id: string;
  readonly authorization_event_id: string;
  readonly approver_id: string;
  readonly authority: string;
  readonly package_digest: string;
  readonly expires_at: string;
  readonly digest: string;
}

export interface DecisionLineage {
  readonly intent_id: string;
  readonly decision_id: string;
  readonly authorization_id: string;
  readonly execution_id: string | null;
  readonly outcome_id: string | null;
  readonly evidence_ids: readonly string[];
  readonly digest: string;
}

export interface ExecutionHistory {
  readonly execution_id: string;
  readonly package_id: string;
  readonly intent: string;
  readonly authority: string;
  readonly evidence_ids: readonly string[];
  readonly approval_id: string;
  readonly states: readonly string[];
  readonly outcome: string | null;
  readonly digest: string;
}
