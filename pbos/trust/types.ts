import type { HistoricalReference, TemporalIdentity } from "../temporal";

export interface EvidenceIdentity {
  readonly id: string;
  readonly version: string;
  readonly authority: string;
  readonly organization_scope: string;
}

export type EvidenceDigest = string;

export interface EvidenceSignature {
  readonly algorithm: "Ed25519";
  readonly key_id: string;
  readonly signature: string;
}

export interface EvidenceCertificate {
  readonly id: string;
  readonly evidence_identity: EvidenceIdentity;
  readonly evidence_digest: EvidenceDigest;
  readonly signature: EvidenceSignature;
  readonly issuer_id: string;
  readonly issued_at: string;
  readonly expires_at: string;
  readonly revoked_at: string | null;
  readonly lineage: readonly HistoricalReference[];
}

export interface TrustRecord {
  readonly identity: EvidenceIdentity;
  readonly digest: EvidenceDigest;
  readonly source: string;
  readonly created_by: string;
  readonly temporal: TemporalIdentity;
  readonly provenance: readonly string[];
  readonly certificate: EvidenceCertificate;
  readonly previous_record_digest: string | null;
  readonly ledger_sequence: number;
  readonly record_digest: string;
}

export interface EvidenceVerification {
  readonly valid: boolean;
  readonly findings: readonly string[];
  readonly verified_by: string;
  readonly verified_at: string;
  readonly digest: string;
}

export interface ValidatorIdentity {
  readonly id: string;
  readonly authority: string;
  readonly public_key_pem: string;
  readonly active: boolean;
}

export interface VerificationRequest {
  readonly id: string;
  readonly record: TrustRecord;
  readonly validator_id: string;
  readonly requested_at: string;
}

export interface VerificationDecision {
  readonly request_id: string;
  readonly decision: "VERIFIED" | "REJECTED";
  readonly validator_id: string;
  readonly findings: readonly string[];
  readonly decided_at: string;
  readonly digest: string;
}

export interface VerificationEvidence {
  readonly request: VerificationRequest;
  readonly decision: VerificationDecision;
  readonly verification: EvidenceVerification;
  readonly digest: string;
}
