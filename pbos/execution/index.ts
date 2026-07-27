import { loadExecutionContext } from "./load";
import { createExecutionPlan } from "./plan";
import {
  generateExecutionContract,
  validateExecutionContract,
} from "./contracts";
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
  }

  return {
    status: plan.status,
    gate: plan.gate,
    tasks: plan.tasks,
  };
}