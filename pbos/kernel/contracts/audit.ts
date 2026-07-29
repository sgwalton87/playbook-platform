import {
  contractResult,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: preserve an immutable, attributable record of governed activity.
 *
 * Ownership: source domains own facts; audit governance owns retention rules.
 * Validation: sequence, source, actor, authority, evidence, and integrity.
 * Failure behavior: incomplete audit history blocks actions requiring proof.
 */
export interface AuditEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly sequence: number;
  readonly sourceId: string;
  readonly actorId: string;
  readonly actionId: string;
  readonly subjectId: string;
  readonly authorityId: string;
  readonly organizationId: string;
  readonly tenantId: string | null;
  readonly eventType: string;
  readonly outcome: "ATTEMPTED" | "ALLOWED" | "DENIED" | "FAILED" | "COMPLETED";
  readonly evidenceIds: readonly string[];
  readonly occurredAt: string;
  readonly previousDigest: string | null;
  readonly digest: string;
}

export function validateAuditEnvelope(
  envelope: AuditEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "audit.id", envelope.id);
  requireIdentifier(errors, "audit.sourceId", envelope.sourceId);
  requireIdentifier(errors, "audit.actorId", envelope.actorId);
  requireIdentifier(errors, "audit.actionId", envelope.actionId);
  requireIdentifier(errors, "audit.subjectId", envelope.subjectId);
  requireIdentifier(errors, "audit.authorityId", envelope.authorityId);
  requireIdentifier(errors, "audit.organizationId", envelope.organizationId);
  requireIdentifier(errors, "audit.eventType", envelope.eventType);
  requireIdentifiers(errors, "audit.evidenceIds", envelope.evidenceIds);
  requireTimestamp(errors, "audit.occurredAt", envelope.occurredAt);
  requireDigest(errors, "audit.digest", envelope.digest);
  if (envelope.previousDigest !== null) {
    requireDigest(errors, "audit.previousDigest", envelope.previousDigest);
  }
  if (envelope.sequence < 0) {
    errors.push("audit sequence must be non-negative.");
  }
  return contractResult(errors);
}
