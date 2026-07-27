import { loadExecutionContext } from "./load";
import { createExecutionPlan } from "./plan";
import {
  generateExecutionContract,
  validateExecutionContract,
} from "./contracts";
import {
  generateCodexWorkPackage,
} from "./work-package";
import {
  generateExecutionAuthorization,
  loadExecutionAuthorizationOrUndefined,
  validateExecutionAuthorization,
} from "./authorization";
import type { ExecutionPlan } from "./types";

export function runExecutionEngine(): ExecutionPlan {
  const context = loadExecutionContext();

  const plan = createExecutionPlan(context);

  if (
    plan.status === "READY" &&
    plan.gate !== "NONE" &&
    context.planning.selectedGate
  ) {
    const contract = generateExecutionContract(
      context.planning.selectedGate
    );

    // Layer 5: Validate contract before generating work package
    const contractValidation = validateExecutionContract(
      contract
    );

    if (!contractValidation.passed) {
      return {
        status: "BLOCKED",
        gate: plan.gate,
        tasks: [],
      };
    }

    // Layer 5: Only generate work package after validation passes
    // This ensures fail-closed behavior if contract is invalid
    const workPackage = generateCodexWorkPackage(
      contract
    );

    // Layer 6: Generate authorization record
    // Sets initial status to PENDING; external systems update to AUTHORIZED/DENIED
    generateExecutionAuthorization(
      contract,
      workPackage
    );

    // Layer 7: Load authorization from runtime artifact
    // This allows external authorization systems to update status between
    // generation (Layer 6) and validation (Layer 7)
    const authorization = loadExecutionAuthorizationOrUndefined();

    // Layer 7: Validate authorization enforcement
    // Fail closed: only AUTHORIZED status permits execution eligibility
    // Missing, PENDING, or DENIED authorization blocks execution
    const authorizationValidation = validateExecutionAuthorization(
      authorization
    );

    if (!authorizationValidation.valid) {
      return {
        status: "BLOCKED",
        gate: plan.gate,
        tasks: [],
      };
    }
  }

  return {
    status: plan.status,
    gate: plan.gate,
    tasks: plan.tasks,
  };
}
