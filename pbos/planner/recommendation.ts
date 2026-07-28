import type { GateEligibility } from "./types";

export function explainSelection(
  selected: GateEligibility | null,
  evaluations: GateEligibility[]
): string {
  if (selected) {
    return `${selected.gate.id} is the first dependency-safe gate by lifecycle stage, priority, and canonical identifier.`;
  }

  const blockers = evaluations
    .filter((evaluation) => evaluation.reasons.length > 0)
    .sort((a, b) => a.gate.id.localeCompare(b.gate.id))
    .map(
      (evaluation) =>
        `${evaluation.gate.id}: ${evaluation.reasons
          .map((reason) => reason.code)
          .join(", ")}`
    );

  return blockers.length > 0
    ? `No gate is eligible. ${blockers.join("; ")}.`
    : "No gate is eligible because no constitutional gates are registered.";
}
