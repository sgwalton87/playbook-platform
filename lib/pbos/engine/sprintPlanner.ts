import type { GateResolution, RecommendedSprint } from "./types";

export function planNextSprint(resolution: GateResolution): RecommendedSprint | null {
  const gate = resolution.nextEligibleGate;
  if (!gate) return null;

  return {
    gate: gate.id,
    goal: gate.goal,
    scope: [...gate.scope],
    requiredFiles: [...gate.required_files],
    constraints: [...gate.constraints],
    acceptanceCriteria: [...gate.acceptance_criteria],
    requiredValidations: [...gate.required_validations],
  };
}
