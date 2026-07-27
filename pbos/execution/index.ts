import { loadExecutionContext } from "./load";
import { createExecutionPlan } from "./plan";
import { ExecutionPlan } from "./types";

export * from "./governed";
export * from "./governed-contracts";

export function runExecutionEngine(): ExecutionPlan {
  const context = loadExecutionContext();

  const plan = createExecutionPlan(context);

  return {
    status: plan.status,
    gate: plan.gate,
    tasks: plan.tasks,
  };
}
