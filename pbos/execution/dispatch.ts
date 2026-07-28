import type { ExecutionPlan } from "./types";

export type ExecutionDispatcher = (
  eligiblePlan: ExecutionPlan
) => ExecutionPlan;

export const dispatchExecutionAdapter: ExecutionDispatcher = (
  eligiblePlan
) => eligiblePlan;
