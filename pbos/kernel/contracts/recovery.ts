import {
  contractResult,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: define bounded containment, restoration, validation, and
 * certification behavior for failed governed actions.
 *
 * Ownership: Resilience coordinates; domain owners retain state authority.
 * Validation: incident, affected state, plan, authority, evidence, and exit.
 * Failure behavior: remain contained; never invent successful restoration.
 */
export interface RecoveryEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly actionId: string;
  readonly incidentId: string;
  readonly affectedSubjectIds: readonly string[];
  readonly recoveryPlanId: string;
  readonly authorityId: string;
  readonly checkpointIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly validationIds: readonly string[];
  readonly certificationIds: readonly string[];
  readonly rollbackAllowed: boolean;
  readonly compensationRequired: boolean;
  readonly requestedAt: string;
  readonly status:
    | "ASSESSED"
    | "AUTHORIZED"
    | "RECOVERING"
    | "VALIDATING"
    | "RESTORED"
    | "CERTIFIED"
    | "BLOCKED";
}

export function validateRecoveryEnvelope(
  envelope: RecoveryEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "recovery.id", envelope.id);
  requireIdentifier(errors, "recovery.actionId", envelope.actionId);
  requireIdentifier(errors, "recovery.incidentId", envelope.incidentId);
  requireIdentifier(errors, "recovery.recoveryPlanId", envelope.recoveryPlanId);
  requireIdentifier(errors, "recovery.authorityId", envelope.authorityId);
  requireIdentifiers(
    errors,
    "recovery.affectedSubjectIds",
    envelope.affectedSubjectIds
  );
  requireIdentifiers(errors, "recovery.checkpointIds", envelope.checkpointIds);
  requireIdentifiers(errors, "recovery.evidenceIds", envelope.evidenceIds);
  requireIdentifiers(errors, "recovery.validationIds", envelope.validationIds);
  requireIdentifiers(
    errors,
    "recovery.certificationIds",
    envelope.certificationIds
  );
  requireTimestamp(errors, "recovery.requestedAt", envelope.requestedAt);
  if (envelope.affectedSubjectIds.length === 0) {
    errors.push("recovery requires at least one affected subject.");
  }
  if (envelope.evidenceIds.length === 0) {
    errors.push("recovery requires evidence.");
  }
  if (envelope.status === "CERTIFIED") {
    if (
      envelope.validationIds.length === 0 ||
      envelope.certificationIds.length === 0
    ) {
      errors.push("certified recovery requires validation and certification.");
    }
  }
  if (envelope.status === "BLOCKED") {
    errors.push("blocked recovery is not eligible for execution.");
  }
  return contractResult(errors);
}
