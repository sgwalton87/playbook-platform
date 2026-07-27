import type { ExecutionContract } from "../contracts";
import type { CodexWorkPackage } from "./types";

export function buildCodexWorkPackage(
  contract: ExecutionContract
): CodexWorkPackage {

  return {
    id: `work-package-${contract.gateId}`,

    version: "1.0.0",

    gateId: contract.gateId,

    objective: contract.objective,

    authorizationRequired:
      contract.authorization !== "AUTHORIZED",

    allowedFiles:
      contract.allowedFiles,

    blockedFiles:
      contract.blockedFiles,

    allowedOperations:
      contract.allowedOperations,

    tasks: [
      "Review execution contract.",
      "Prepare governed implementation plan.",
      ...contract.requiredValidation,
    ],

    requiredValidation:
      contract.requiredValidation,

    evidenceRequirements:
      contract.evidenceRequirements,

    createdAt:
      new Date().toISOString(),
  };
}
