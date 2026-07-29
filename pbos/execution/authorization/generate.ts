import { Runtime, Artifacts } from "../../kernel";
import path from "node:path";
import type { ExecutionContract } from "../contracts";
import type { CodexWorkPackage } from "../work-package";
import { buildExecutionAuthorization } from "./builder";
import { loadExecutionAuthorizationOrUndefined } from "./load";

/**
 * Generate an execution authorization record.
 *
 * Layer 6: Creates a new authorization artifact that documents
 * the governance decision gate. This record references both the
 * contract and work package, creating an audit trail.
 */
export function generateExecutionAuthorization(
  contract: ExecutionContract,
  workPackage: CodexWorkPackage,
  rootDir = process.cwd()
) {
  const existing = loadExecutionAuthorizationOrUndefined(rootDir);
  const artifactPath = path.join(
    rootDir,
    Artifacts.executionAuthorization
  );

  if (existing) {
    const expected = buildExecutionAuthorization(contract, workPackage);
    const sameIdentity =
      existing.id === expected.id &&
      existing.gateId === expected.gateId &&
      existing.contractId === expected.contractId &&
      existing.workPackageId === expected.workPackageId &&
      existing.contract.digest === expected.contract.digest &&
      existing.workPackage.digest === expected.workPackage.digest;

    if (!sameIdentity) {
      throw new Error(
        "Execution authorization already exists for different immutable artifacts."
      );
    }

    return existing;
  }

  const authorization =
    buildExecutionAuthorization(contract, workPackage);

  Runtime.save(
    artifactPath,
    authorization,
    "execution-authorization"
  );

  if (!Runtime.exists(artifactPath)) {
    throw new Error(
      "Execution authorization artifact was not persisted."
    );
  }

  return authorization;
}
