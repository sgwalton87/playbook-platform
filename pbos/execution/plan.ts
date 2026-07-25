import { ExecutionContext, ExecutionPlan } from "./types";

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

  return {

    status: "READY",

    gate: gate.id,

    tasks: gate.tasks,

  };

}
