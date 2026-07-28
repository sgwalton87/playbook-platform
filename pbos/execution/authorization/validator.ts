import type { ExecutionAuthorizationRecord } from "./types";
import type { ExecutionContract } from "../contracts";
import type { CodexWorkPackage } from "../work-package";
import { Artifacts, artifactDigest } from "../../kernel";

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
  authorization: ExecutionAuthorizationRecord | undefined,
  contract?: ExecutionContract,
  workPackage?: CodexWorkPackage
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

  if (!contract) {
    errors.push(
      "Execution blocked: referenced execution contract is missing."
    );
  }

  if (!workPackage) {
    errors.push(
      "Execution blocked: referenced work package is missing."
    );
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

  if (
    !authorization.contract ||
    authorization.contract.artifact !== Artifacts.executionContract ||
    authorization.contract.id !== authorization.contractId
  ) {
    errors.push(
      "Execution blocked: authorization contract identity is invalid."
    );
  }

  if (
    !authorization.workPackage ||
    authorization.workPackage.artifact !== Artifacts.workPackage ||
    authorization.workPackage.id !== authorization.workPackageId
  ) {
    errors.push(
      "Execution blocked: authorization work package identity is invalid."
    );
  }

  if (
    contract &&
    (
      authorization.contractId !== contract.id ||
      authorization.gateId !== contract.gateId ||
      authorization.contract.version !== contract.version ||
      authorization.contract.digest !== artifactDigest(contract)
    )
  ) {
    errors.push(
      "Execution blocked: authorization does not match the immutable execution contract."
    );
  }

  if (
    workPackage &&
    (
      authorization.workPackageId !== workPackage.id ||
      authorization.gateId !== workPackage.gateId ||
      authorization.workPackage.version !== workPackage.version ||
      authorization.workPackage.digest !== artifactDigest(workPackage)
    )
  ) {
    errors.push(
      "Execution blocked: authorization does not match the immutable work package."
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

  if (
    authorization.status === "AUTHORIZED" &&
    (
      !authorization.approvedBy ||
      !authorization.approvalReason
    )
  ) {
    errors.push(
      "Execution blocked: authorized decision metadata is incomplete."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
