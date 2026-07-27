import type { ExecutionContract } from "../contracts";
import type {
  ExecutionAuthorizationRecord,
} from "./types";

export function buildExecutionAuthorization(
  contract: ExecutionContract
): ExecutionAuthorizationRecord {

  return {
    id: `authorization-${contract.gateId}`,

    version: "1.0.0",

    contractId: contract.id,

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
