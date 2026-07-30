import type { PBOSIdentity } from "../identity";
import type { HistoricalReference, TemporalIdentity } from "../temporal";

export interface EvidenceSource {
  readonly id: string;
  readonly uri: string;
  readonly owner: string;
  readonly authority: string;
  readonly source_digest: string;
}

export type EvidenceDigest = string;

export interface EvidenceRecord {
  readonly identity: PBOSIdentity;
  readonly created_by: string;
  readonly approved_by: string | null;
  readonly source: EvidenceSource;
  readonly temporal: TemporalIdentity;
  readonly content_digest: EvidenceDigest;
  readonly validation: EvidenceValidation;
  readonly lineage: readonly HistoricalReference[];
  readonly digest: EvidenceDigest;
}

export interface EvidenceValidation {
  readonly status: "PENDING" | "PASS" | "FAIL";
  readonly validator: string;
  readonly findings: readonly string[];
  readonly validated_at: string | null;
}

export interface Claim {
  readonly id: string;
  readonly statement: string;
  readonly authority: string;
  readonly evidence_ids: readonly string[];
  readonly temporal: TemporalIdentity;
}

export interface Decision {
  readonly id: string;
  readonly intent: string;
  readonly actor_id: string;
  readonly authority: string;
  readonly evidence_ids: readonly string[];
  readonly approved_by: string;
  readonly temporal: TemporalIdentity;
}

export interface Action {
  readonly id: string;
  readonly decision_id: string;
  readonly authorization_id: string;
  readonly execution_id: string;
  readonly evidence_ids: readonly string[];
  readonly temporal: TemporalIdentity;
}

export interface Outcome {
  readonly id: string;
  readonly action_id: string;
  readonly status: "SUCCEEDED" | "FAILED" | "INCONCLUSIVE";
  readonly evidence_ids: readonly string[];
  readonly temporal: TemporalIdentity;
}

export interface TruthLineage {
  readonly claim: Claim;
  readonly decision: Decision;
  readonly action: Action;
  readonly outcome: Outcome;
  readonly digest: string;
}
