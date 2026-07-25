import type { ExecutionContext, ExecutionPlan } from "./types";

export function createExecutionPlan(
  ctx: ExecutionContext
): ExecutionPlan {
  if (ctx.validation.status !== "PASS") {
    return {
      status: "BLOCKED",
      gate: "NONE",
      tasks: [],
    };
  }

  const gate = ctx.planning.selectedGate;

  if (!gate) {
    return {
      status: "BLOCKED",
      gate: "NONE",
      tasks: [],
    };
  }

  return {
    status: "READY",
    gate: gate.id,
    tasks: gate.tasks,
  };
}
