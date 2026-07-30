import { artifactDigest } from "../../kernel/identity";
import type {
  StorageCertificationDecision,
  StorageCertificationReview,
  StorageEvidencePackage,
  TrustProvider,
  TrustStorageProvider,
} from "./types";

export function validateTrustProvider(value: TrustProvider): readonly string[] {
  return [
    ...(!value.owner_id || !value.authority
      ? ["Provider ownership or authority is missing."]
      : []),
    ...(value.scope.length === 0 ? ["Provider scope is missing."] : []),
    ...(value.evidence_ids.length === 0
      ? ["Provider evidence is missing."]
      : []),
    ...(artifactDigest({ ...value, digest: undefined }) !== value.digest
      ? ["Provider record is altered."]
      : []),
  ];
}

export function reviewStorageProvider(input: {
  readonly provider: TrustStorageProvider;
  readonly evidence: StorageEvidencePackage;
  readonly reviewer_id: string;
  readonly independent: boolean;
  readonly timestamp: string;
}): StorageCertificationReview {
  const evidenceDomains = [
    input.evidence.durability_evidence,
    input.evidence.availability_evidence,
    input.evidence.integrity_evidence,
    input.evidence.replication_evidence,
    input.evidence.recovery_evidence,
    input.evidence.retention_evidence,
    input.evidence.auditability_evidence,
  ];
  const findings = [
    ...validateTrustProvider(input.provider),
    ...(input.provider.lifecycle !== "UNDER_REVIEW"
      ? ["Storage provider is not under review."]
      : []),
    ...(input.evidence.provider_id !== input.provider.id
      ? ["Storage evidence provider identity mismatches."]
      : []),
    ...(evidenceDomains.some((items) => items.length === 0)
      ? ["Storage evidence package is incomplete."]
      : []),
    ...(!input.independent ? ["Storage review is not independent."] : []),
  ];
  const body: StorageCertificationReview = {
    provider_id: input.provider.id,
    evidence_digest: input.evidence.digest,
    reviewer_id: input.reviewer_id,
    independent: input.independent,
    findings,
    timestamp: input.timestamp,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

export function decideStorageCertification(input: {
  readonly review: StorageCertificationReview;
  readonly decided_by: string;
  readonly scope: readonly string[];
  readonly expires_at: string | null;
}): StorageCertificationDecision {
  const certified =
    input.review.independent &&
    input.review.findings.length === 0 &&
    Boolean(input.decided_by) &&
    input.scope.length > 0 &&
    Boolean(input.expires_at);
  const body: StorageCertificationDecision = {
    provider_id: input.review.provider_id,
    decision: certified ? "CERTIFIED" : "REJECTED",
    decided_by: input.decided_by,
    review_digest: input.review.digest,
    scope: [...input.scope].sort(),
    expires_at: certified ? input.expires_at : null,
    findings: certified
      ? []
      : [
          ...input.review.findings,
          ...(!input.decided_by ? ["Certification authority is missing."] : []),
          ...(input.scope.length === 0 ? ["Certification scope is missing."] : []),
          ...(!input.expires_at ? ["Certification expiry is missing."] : []),
        ],
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
