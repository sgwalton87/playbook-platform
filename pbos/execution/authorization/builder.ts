import type { ExecutionContract } from "../contracts";
import type { CodexWorkPackage } from "../work-package";
import type {
  ExecutionAuthorizationRecord,
} from "./types";

/**
 * Build an authorization record from contract and work package.
 *
 * Layer 6: Creates a new authorization record in PENDING state.
 * This record is later approved or denied in the authorization decision flow.
 */
export function buildExecutionAuthorization(
  contract: ExecutionContract,
  workPackage: CodexWorkPackage
): ExecutionAuthorizationRecord {

  return {
    id: `authorization-${contract.gateId}`,

    version: "1.0.0",

    contractId: contract.id,

    workPackageId: workPackage.id,

    gateId: contract.gateId,

    status: "PENDING",

    approvedBy: null,

    approvalReason: null,

    evidenceReviewed: [
      "execution-contract.json",
      "work-package.json",
    ],

    createdAt: new Date().toISOString(),

    authorizedAt: null,
  };
}
