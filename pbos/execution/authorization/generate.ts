import { Runtime, Artifacts } from "../../kernel";
import type { ExecutionContract } from "../contracts";
import type { CodexWorkPackage } from "../work-package";
import { buildExecutionAuthorization } from "./builder";

/**
 * Generate an execution authorization record.
 *
 * Layer 6: Creates a new authorization artifact that documents
 * the governance decision gate. This record references both the
 * contract and work package, creating an audit trail.
 */
export function generateExecutionAuthorization(
  contract: ExecutionContract,
  workPackage: CodexWorkPackage
) {

  const authorization =
    buildExecutionAuthorization(contract, workPackage);

  Runtime.save(
    Artifacts.executionAuthorization,
    authorization
  );

  if (!Runtime.exists(Artifacts.executionAuthorization)) {
    throw new Error(
      "Execution authorization artifact was not persisted."
    );
  }

  return authorization;
}
