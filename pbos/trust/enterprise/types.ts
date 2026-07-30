export type TrustProviderType =
  | "IDENTITY"
  | "STORAGE"
  | "EVIDENCE"
  | "RECOVERY"
  | "SECURITY"
  | "OBSERVABILITY";

export type KeyLifecycleState =
  | "REGISTERED"
  | "ACTIVE"
  | "ROTATING"
  | "EXPIRED"
  | "REVOKED"
  | "COMPROMISED"
  | "RETIRED";

export interface KeyOwnershipRecord {
  readonly key_id: string;
  readonly provider_id: string;
  readonly owner_id: string;
  readonly authority: string;
  readonly purpose: string;
  readonly organization_scope: string;
  readonly public_key_fingerprint: string;
  readonly digest: string;
}

export interface KeyLifecycleRecord {
  readonly key_id: string;
  readonly state: KeyLifecycleState;
  readonly effective_at: string;
  readonly expires_at: string;
  readonly approved_by: string;
  readonly evidence_ids: readonly string[];
  readonly previous_digest: string | null;
  readonly digest: string;
}

export interface KeyRotationEvent {
  readonly id: string;
  readonly previous_key_id: string;
  readonly next_key_id: string;
  readonly authorized_by: string;
  readonly reason: string;
  readonly evidence_ids: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface KeyRevocationEvent {
  readonly id: string;
  readonly key_id: string;
  readonly revoked_by: string;
  readonly reason: string;
  readonly compromised: boolean;
  readonly evidence_ids: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface KeyVerificationRecord {
  readonly key_id: string;
  readonly valid: boolean;
  readonly findings: readonly string[];
  readonly verified_by: string;
  readonly verified_at: string;
  readonly digest: string;
}

export interface TrustProvider {
  readonly id: string;
  readonly type: TrustProviderType;
  readonly owner_id: string;
  readonly authority: string;
  readonly scope: readonly string[];
  readonly evidence_ids: readonly string[];
  readonly lifecycle:
    | "REGISTERED"
    | "EVIDENCE_REQUIRED"
    | "UNDER_REVIEW"
    | "VALIDATED"
    | "CERTIFIED"
    | "SUSPENDED"
    | "RETIRED";
  readonly history: readonly string[];
  readonly digest: string;
}

export interface TrustStorageProvider extends TrustProvider {
  readonly type: "STORAGE";
  readonly durability_target: string;
  readonly availability_target: string;
  readonly replication_model: string;
  readonly recovery_target: string;
  readonly retention_policy: string;
  readonly audit_model: string;
}

export interface StorageEvidencePackage {
  readonly provider_id: string;
  readonly durability_evidence: readonly string[];
  readonly availability_evidence: readonly string[];
  readonly integrity_evidence: readonly string[];
  readonly replication_evidence: readonly string[];
  readonly recovery_evidence: readonly string[];
  readonly retention_evidence: readonly string[];
  readonly auditability_evidence: readonly string[];
  readonly digest: string;
}

export interface StorageCertificationReview {
  readonly provider_id: string;
  readonly evidence_digest: string;
  readonly reviewer_id: string;
  readonly independent: boolean;
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface StorageCertificationDecision {
  readonly provider_id: string;
  readonly decision: "CERTIFIED" | "REJECTED";
  readonly decided_by: string;
  readonly review_digest: string;
  readonly scope: readonly string[];
  readonly expires_at: string | null;
  readonly findings: readonly string[];
  readonly digest: string;
}
