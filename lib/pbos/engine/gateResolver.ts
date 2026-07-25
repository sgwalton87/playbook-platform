import type { EngineeringGate, EngineeringGates, GateResolution } from "./types";

export function resolveGates(input: EngineeringGates): GateResolution {
  const gates = input.gates;
  const completedIds = new Set(gates.filter((gate) => gate.status === "completed").map((gate) => gate.id));
  const isEligible = (gate: EngineeringGate) =>
    gate.status === "pending" && gate.depends_on.every((dependency) => completedIds.has(dependency));

  return {
    currentGate: gates.find((gate) => gate.status === "current") ?? null,
    completedGates: gates.filter((gate) => gate.status === "completed"),
    blockedGates: gates.filter(
      (gate) => gate.status === "blocked" || (gate.status === "pending" && !gate.depends_on.every((dependency) => completedIds.has(dependency))),
    ),
    nextEligibleGate: gates.find(isEligible) ?? null,
  };
}
