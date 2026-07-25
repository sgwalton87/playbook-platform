import type { PlanningDecision } from "../planner/types";
import type { ValidationResult } from "../validator/types";

export interface ExecutionContext {
  repository: unknown;
  planning: PlanningDecision;
  validation: ValidationResult;
}

export interface ExecutionPlan {
  status: "READY" | "BLOCKED";
  gate: string;
  tasks: string[];
}
