import type { ExecutionReport, GateResolution, PbosState, RecommendedSprint, ValidationResult } from "./types";

export function createExecutionReport(
  state: PbosState,
  validation: ValidationResult,
  resolution: GateResolution,
  sprint: RecommendedSprint | null,
): ExecutionReport {
  return {
    repositoryStatus: state.repositoryState.status,
    currentGate: resolution.currentGate?.id ?? null,
    currentHealth: state.repositoryHealth.health,
    currentBlockers: [...state.repositoryHealth.blockers],
    recommendedSprint: sprint,
    validationSummary: { valid: validation.valid, issueCount: validation.issues.length, issues: [...validation.issues] },
    confidence: validation.valid && collectUnknowns(state).length === 0 ? "HIGH" : "LOW",
    unknownInformation: collectUnknowns(state),
  };
}

function collectUnknowns(value: unknown, path = "$", found: string[] = []): string[] {
  if (value === "UNKNOWN") found.push(path);
  else if (Array.isArray(value)) value.forEach((item, index) => collectUnknowns(item, `${path}[${index}]`, found));
  else if (value !== null && typeof value === "object") Object.entries(value).forEach(([key, item]) => collectUnknowns(item, `${path}.${key}`, found));
  return found;
}
