import { ValidationCheck, ValidationContext } from "./types";
import { isPlanningEligibleStatus } from "../lifecycle/status";

export function runChecks(ctx: ValidationContext): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  const gate = ctx.planning?.selectedGate;
  const planning = ctx.planning as PlanningDecision & {
    state?: string;
    authority?: string;
  };
  const validIdle =
    gate == null &&
    planning.state === "VALID_IDLE" &&
    planning.authority === "constitutional-planner";

  checks.push({
    name: "Repository Artifact",
    status: ctx.repository ? "PASS" : "FAIL",
    message: "repository.json loaded",
  });

  checks.push({
    name: "Planning Artifact",
    status: ctx.planning ? "PASS" : "FAIL",
    message: "next-gate.json loaded",
  });

  checks.push({
    name: "Selected Gate",
    status: gate?.id || validIdle ? "PASS" : "FAIL",
    message: gate?.id ?? (validIdle ? "Valid idle" : "No gate selected"),
  });

  checks.push({
    name: "Planning Eligible",
    status: validIdle || isPlanningEligibleStatus(gate?.status)
      ? "PASS"
      : "FAIL",
    message: gate?.status ?? (validIdle ? "VALID_IDLE" : "Unknown"),
  });

  return checks;
}
