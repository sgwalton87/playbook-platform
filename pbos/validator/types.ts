import type { PlanningDecision } from "../planner/types";

export interface ValidationCheck {
  name: string;
  status: "PASS" | "FAIL";
  message: string;
}

export interface ValidationContext {
  repository: unknown;
  planning: PlanningDecision;
}

export interface ValidationResult {
  status: "PASS" | "FAIL";
  selectedGate: string;
  checks: ValidationCheck[];
}
