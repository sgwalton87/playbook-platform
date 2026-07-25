import { ValidationCheck, ValidationContext } from "./types";

export function runChecks(ctx: ValidationContext): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  const gate = ctx.planning?.selectedGate;

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
    status: gate?.id ? "PASS" : "FAIL",
    message: gate?.id ?? "No gate selected",
  });

  checks.push({
    name: "Planning Eligible",
    status:
      gate?.status === "in_progress" ||
      gate?.status === "proposed"
        ? "PASS"
        : "FAIL",
    message: gate?.status ?? "Unknown",
  });

  return checks;
}