import {
  contractResult,
  requireChronology,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: represent a scoped, expiring, revocable trust assertion.
 *
 * Ownership: Certification Authority owns certification state and history.
 * Validation: issuer, subject, evidence, scope, time, and current status.
 * Failure behavior: non-current certification cannot authorize consumption.
 */
export interface CertificationTrustEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly issuerId: string;
  readonly subjectId: string;
  readonly subjectDigest: string;
  readonly evidenceIds: readonly string[];
  readonly validationIds: readonly string[];
  readonly organizationId: string;
  readonly tenantId: string | null;
  readonly conditions: readonly string[];
  readonly status: "CANDIDATE" | "CERTIFIED" | "SUSPENDED" | "EXPIRED" | "REVOKED";
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly revocationId: string | null;
  readonly supersedesId: string | null;
}

export function validateCertificationTrustEnvelope(
  envelope: CertificationTrustEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "certification.id", envelope.id);
  requireIdentifier(errors, "certification.issuerId", envelope.issuerId);
  requireIdentifier(errors, "certification.subjectId", envelope.subjectId);
  requireIdentifier(
    errors,
    "certification.subjectDigest",
    envelope.subjectDigest
  );
  requireIdentifier(
    errors,
    "certification.organizationId",
    envelope.organizationId
  );
  requireIdentifiers(
    errors,
    "certification.evidenceIds",
    envelope.evidenceIds
  );
  requireIdentifiers(
    errors,
    "certification.validationIds",
    envelope.validationIds
  );
  requireTimestamp(errors, "certification.issuedAt", envelope.issuedAt);
  requireTimestamp(errors, "certification.expiresAt", envelope.expiresAt);
  requireChronology(
    errors,
    "certification.issuedAt",
    envelope.issuedAt,
    "certification.expiresAt",
    envelope.expiresAt
  );
  if (envelope.status !== "CERTIFIED") {
    errors.push("certification status must be CERTIFIED.");
  }
  if (envelope.revocationId !== null) {
    errors.push("certification cannot have a revocation reference.");
  }
  if (envelope.evidenceIds.length === 0 || envelope.validationIds.length === 0) {
    errors.push("certification requires evidence and validation.");
  }
  return contractResult(errors);
}
