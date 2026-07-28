import type { GateEligibility } from "./types";

export function selectOneGate(
  evaluations: GateEligibility[]
): GateEligibility | null {
  return (
    evaluations
      .filter((evaluation) => evaluation.eligible)
      .sort(
        (a, b) =>
          a.gate.lifecycle_stage - b.gate.lifecycle_stage ||
          b.gate.priority - a.gate.priority ||
          a.gate.id.localeCompare(b.gate.id)
      )[0] ?? null
  );
}
