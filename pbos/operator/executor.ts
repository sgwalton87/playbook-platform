import type { OperatorPlan } from "./planner";

export interface OperatorExecutionResult {
  readonly plan: OperatorPlan;
  readonly status: "READY" | "WAITING_FOR_AUTHORITY" | "NO_ACTION";
  readonly mutation_performed: false;
}

export function executeSafeOperatorActions(
  plan: OperatorPlan
): OperatorExecutionResult {
  return {
    plan,
    status: plan.human_action
      ? "WAITING_FOR_AUTHORITY"
      : plan.decision.transition === "NONE"
        ? "NO_ACTION"
        : "READY",
    mutation_performed: false,
  };
}
