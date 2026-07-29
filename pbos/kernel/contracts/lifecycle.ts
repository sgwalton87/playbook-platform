import {
  contractResult,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: express domain-neutral lifecycle intent without moving domain
 * semantics into the Kernel.
 *
 * Ownership: Lifecycle Management owns committed transition truth.
 * Validation: registered adjacency, authority, evidence, and subject identity.
 * Failure behavior: reject the request and preserve the prior committed state.
 */
export const UNIVERSAL_LIFECYCLE_STATES = [
  "PROPOSED",
  "REVIEWED",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
  "RESTRICTED",
  "DEPRECATED",
  "RETIRED",
  "ARCHIVED",
] as const;

export type UniversalLifecycleState =
  (typeof UNIVERSAL_LIFECYCLE_STATES)[number];

export interface LifecycleTransitionEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly subjectId: string;
  readonly lifecycleDefinitionId: string;
  readonly from: UniversalLifecycleState;
  readonly to: UniversalLifecycleState;
  readonly authorityId: string;
  readonly evidenceIds: readonly string[];
  readonly validationIds: readonly string[];
  readonly requestedAt: string;
  readonly expectedRevision: number;
}

export function validateLifecycleTransitionEnvelope(
  envelope: LifecycleTransitionEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "lifecycle.id", envelope.id);
  requireIdentifier(errors, "lifecycle.subjectId", envelope.subjectId);
  requireIdentifier(
    errors,
    "lifecycle.lifecycleDefinitionId",
    envelope.lifecycleDefinitionId
  );
  requireIdentifier(errors, "lifecycle.authorityId", envelope.authorityId);
  requireIdentifiers(errors, "lifecycle.evidenceIds", envelope.evidenceIds);
  requireIdentifiers(errors, "lifecycle.validationIds", envelope.validationIds);
  requireTimestamp(errors, "lifecycle.requestedAt", envelope.requestedAt);
  if (envelope.from === envelope.to) {
    errors.push("lifecycle transition must change state.");
  }
  if (envelope.expectedRevision < 0) {
    errors.push("lifecycle expectedRevision must be non-negative.");
  }
  if (envelope.evidenceIds.length === 0) {
    errors.push("lifecycle transition requires evidence.");
  }
  if (envelope.validationIds.length === 0) {
    errors.push("lifecycle transition requires validation.");
  }
  return contractResult(errors);
}
