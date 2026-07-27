import type { ExecutionContract } from "./types";

export interface ContractValidationResult {
  passed: boolean;
  message: string;
}

export function validateExecutionContract(
  contract: ExecutionContract | undefined
): ContractValidationResult {

  if (!contract) {
    return {
      passed: false,
      message: "Execution blocked: authorization contract missing.",
    };
  }

  if (contract.authorization !== "AUTHORIZED") {
    return {
      passed: false,
      message: "Execution blocked: contract is not authorized.",
    };
  }

  if (!contract.gateId) {
    return {
      passed: false,
      message: "Execution blocked: gate identity missing.",
    };
  }

  if (contract.requiredValidation.length === 0) {
    return {
      passed: false,
      message: "Execution blocked: validation requirements missing.",
    };
  }

  return {
    passed: true,
    message: "Execution contract authorized.",
  };
}
