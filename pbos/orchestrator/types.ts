import { PBOSWorld } from "../world";
import { DecisionResult } from "../decision";

export type OrchestrationPhase =
  | "observe"
  | "understand"
  | "reason"
  | "plan"
  | "validate"
  | "execute"
  | "verify"
  | "learn";

export interface Observation {
  startedAt: string;
  world: PBOSWorld;
}

export interface Reasoning {
  observation: Observation;
  decision: DecisionResult;
}

export interface OrchestrationResult {
  startedAt: string;
  finishedAt: string;
  success: boolean;
  world: PBOSWorld;
  decision: DecisionResult;
}
