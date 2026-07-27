import type { ExecutionAuthorizationRecord } from "./types";

export interface AuthorizationValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an authorization record for execution eligibility.
 *
 * Layer 6 Certification Requirements (Fail Closed):
 *
 * - Authorization must exist (FAIL if missing)
 * - Authorization status must be AUTHORIZED (FAIL if PENDING or DENIED)
 * - Authorization must reference contract (FAIL if missing contractId)
 * - Authorization must reference work package (FAIL if missing workPackageId)
 * - Authorization must reference gate (FAIL if missing gateId)
 * - Authorization evidence must be reviewed (FAIL if empty)
 * - Authorization lifecycle must be complete (FAIL if authorizedAt is null when status is AUTHORIZED)
 * - Authorization version must be valid (FAIL if missing or invalid)
 *
 * Only status = "AUTHORIZED" permits execution.
 */
export function validateExecutionAuthorization(
  authorization: ExecutionAuthorizationRecord | undefined
): AuthorizationValidationResult {
  const errors: string[] = [];

  if (!authorization) {
    return {
      valid: false,
      errors: [
        "Execution blocked: authorization record is missing.",
      ],
    };
  }

  // Fail closed: only AUTHORIZED status passes
  if (authorization.status !== "AUTHORIZED") {
    errors.push(
      `Execution blocked: authorization status is "${authorization.status}", not AUTHORIZED.`
    );
  }

  if (!authorization.id || authorization.id.trim() === "") {
    errors.push(
      "Execution blocked: authorization id is missing or empty."
    );
  }

  if (
    !authorization.version ||
    authorization.version.trim() === ""
  ) {
    errors.push(
      "Execution blocked: authorization version is missing or empty."
    );
  }

  if (
    !authorization.contractId ||
    authorization.contractId.trim() === ""
  ) {
    errors.push(
      "Execution blocked: authorization contractId is missing or empty."
    );
  }

  if (
    !authorization.workPackageId ||
    authorization.workPackageId.trim() === ""
  ) {
    errors.push(
      "Execution blocked: authorization workPackageId is missing or empty."
    );
  }

  if (!authorization.gateId || authorization.gateId.trim() === "") {
    errors.push(
      "Execution blocked: authorization gateId is missing or empty."
    );
  }

  if (
    !authorization.evidenceReviewed ||
    authorization.evidenceReviewed.length === 0
  ) {
    errors.push(
      "Execution blocked: authorization evidenceReviewed is missing or empty."
    );
  }

  // If status is AUTHORIZED, must have authorizedAt timestamp
  if (
    authorization.status === "AUTHORIZED" &&
    !authorization.authorizedAt
  ) {
    errors.push(
      "Execution blocked: authorization is AUTHORIZED but authorizedAt timestamp is missing."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
