import {
  contractResult,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: prove who acted, what action occurred, which authority and decision
 * allowed it, and which validation and certification support the history.
 *
 * Ownership: source domains own evidence meaning; Artifact Intelligence owns
 * identity and lineage.
 * Validation: issuer, digest, scope, chronology, and references are mandatory.
 * Failure behavior: invalid evidence cannot support trust.
 */
export interface EvidenceEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly type: string;
  readonly issuerId: string;
  readonly actorId: string;
  readonly actionId: string;
  readonly subjectId: string;
  readonly authorityId: string;
  readonly decisionIds: readonly string[];
  readonly validationIds: readonly string[];
  readonly certificationIds: readonly string[];
  readonly historicalReferenceIds: readonly string[];
  readonly organizationId: string;
  readonly tenantId: string | null;
  readonly uri: string;
  readonly digest: string;
  readonly occurredAt: string;
  readonly capturedAt: string;
  readonly classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
}

export function validateEvidenceEnvelope(
  envelope: EvidenceEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "evidence.id", envelope.id);
  requireIdentifier(errors, "evidence.type", envelope.type);
  requireIdentifier(errors, "evidence.issuerId", envelope.issuerId);
  requireIdentifier(errors, "evidence.actorId", envelope.actorId);
  requireIdentifier(errors, "evidence.actionId", envelope.actionId);
  requireIdentifier(errors, "evidence.subjectId", envelope.subjectId);
  requireIdentifier(errors, "evidence.authorityId", envelope.authorityId);
  requireIdentifier(errors, "evidence.organizationId", envelope.organizationId);
  requireIdentifier(errors, "evidence.uri", envelope.uri);
  requireDigest(errors, "evidence.digest", envelope.digest);
  requireIdentifiers(errors, "evidence.decisionIds", envelope.decisionIds);
  requireIdentifiers(errors, "evidence.validationIds", envelope.validationIds);
  requireIdentifiers(
    errors,
    "evidence.certificationIds",
    envelope.certificationIds
  );
  requireIdentifiers(
    errors,
    "evidence.historicalReferenceIds",
    envelope.historicalReferenceIds
  );
  requireTimestamp(errors, "evidence.occurredAt", envelope.occurredAt);
  requireTimestamp(errors, "evidence.capturedAt", envelope.capturedAt);
  if (Date.parse(envelope.capturedAt) < Date.parse(envelope.occurredAt)) {
    errors.push("evidence.capturedAt cannot precede occurredAt.");
  }
  if (envelope.decisionIds.length === 0) {
    errors.push("evidence requires at least one decision reference.");
  }
  return contractResult(errors);
}
