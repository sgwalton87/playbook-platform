import type { PlanningDecision } from "../planner/types";
import type { ValidationResult } from "../validator/types";
import type { ExecutionContract } from "./contracts/types";

export interface ExecutionContext {
  repository: unknown;
  planning: PlanningDecision;
  validation: ValidationResult;
  contract?: ExecutionContract;
}

export interface ExecutionPlan {
  status: "READY" | "BLOCKED";
  gate: string;
  tasks: string[];
}
