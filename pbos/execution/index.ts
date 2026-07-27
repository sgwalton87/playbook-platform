import { loadExecutionContext } from "./load";
import { createExecutionPlan } from "./plan";
import {
  generateExecutionContract,
  validateExecutionContract,
} from "./contracts";
import {
  generateCodexWorkPackage,
} from "./work-package";
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
    const validation = validateExecutionContract(
      contract
    );

    if (!validation.passed) {
      return {
        status: "BLOCKED",
        gate: plan.gate,
        tasks: [],
      };
    }

    // Layer 5: Only generate work package after validation passes
    // This ensures fail-closed behavior if contract is invalid
    generateCodexWorkPackage(
      contract
    );
  }

  return {
    status: plan.status,
    gate: plan.gate,
    tasks: plan.tasks,
  };
}
