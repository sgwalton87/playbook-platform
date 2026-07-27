import type { ExecutionContract } from "../contracts";

export interface WorkPackageValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate that a contract is suitable for work package generation.
 *
 * Layer 5 Certification Requirements:
 * - Contract must exist (fail closed)
 * - Contract must have a valid gateId (fail closed)
 * - Contract must have an objective (fail closed)
 * - Contract must specify requiredValidation (fail closed)
 * - Contract must specify evidenceRequirements (fail closed)
 * - Contract allowedFiles must not be empty (fail closed)
 * - Contract blockedFiles must not be empty (fail closed)
 * - Contract allowedOperations must not be empty (fail closed)
 */
export function validateWorkPackageContract(
  contract: ExecutionContract | undefined
): WorkPackageValidationResult {
  const errors: string[] = [];

  if (!contract) {
    return {
      valid: false,
      errors: ["Work package generation failed: execution contract is missing"],
    };
  }

  if (!contract.gateId || contract.gateId.trim() === "") {
    errors.push(
      "Work package generation failed: contract gateId is missing or empty"
    );
  }

  if (!contract.objective || contract.objective.trim() === "") {
    errors.push(
      "Work package generation failed: contract objective is missing or empty"
    );
  }

  if (!contract.requiredValidation || contract.requiredValidation.length === 0) {
    errors.push(
      "Work package generation failed: contract requiredValidation is missing or empty"
    );
  }

  if (
    !contract.evidenceRequirements ||
    contract.evidenceRequirements.length === 0
  ) {
    errors.push(
      "Work package generation failed: contract evidenceRequirements is missing or empty"
    );
  }

  if (!contract.allowedFiles || contract.allowedFiles.length === 0) {
    errors.push(
      "Work package generation failed: contract allowedFiles is missing or empty"
    );
  }

  if (!contract.blockedFiles || contract.blockedFiles.length === 0) {
    errors.push(
      "Work package generation failed: contract blockedFiles is missing or empty"
    );
  }

  if (!contract.allowedOperations || contract.allowedOperations.length === 0) {
    errors.push(
      "Work package generation failed: contract allowedOperations is missing or empty"
    );
  }

  if (!contract.id || contract.id.trim() === "") {
    errors.push(
      "Work package generation failed: contract id is missing or empty"
    );
  }

  if (!contract.version || contract.version.trim() === "") {
    errors.push(
      "Work package generation failed: contract version is missing or empty"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
