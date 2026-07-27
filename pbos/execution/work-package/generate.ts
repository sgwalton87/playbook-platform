import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import type { ExecutionContract } from "../contracts";
import { buildCodexWorkPackage } from "./builder";
import { validateWorkPackageContract } from "./validator";

export const WorkPackageArtifact =
  Artifacts.workPackage;

/**
 * Generate a Codex work package from an execution contract.
 *
 * Layer 5 Certification: This function enforces strict validation
 * and fails closed if the contract is missing or invalid.
 *
 * Throws an error if:
 * - contract is undefined
 * - contract is missing required fields
 * - contract has invalid field values
 */
export function generateCodexWorkPackage(
  contract: ExecutionContract | undefined
) {
  // Layer 5: Validate contract before generating work package
  const validation =
    validateWorkPackageContract(contract);

  if (!validation.valid) {
    const errorMessages =
      validation.errors.join("; ");
    throw new Error(
      `Work package generation blocked: ${errorMessages}`
    );
  }

  // After validation passes, contract is guaranteed to be defined
  if (!contract) {
    throw new Error(
      "Work package generation failed: contract is undefined after validation"
    );
  }

  const packageData =
    buildCodexWorkPackage(contract);

  Runtime.save(
    path.join(
      process.cwd(),
      WorkPackageArtifact
    ),
    packageData
  );

  return packageData;
}
