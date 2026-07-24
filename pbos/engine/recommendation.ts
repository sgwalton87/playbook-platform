import type { GateDefinition } from "./types";
import type { ReleaseTransition } from "../release/state-machine";

export interface GateRecommendation {
  recommendedNextGate: string | null;
  reason: string;
}

export function recommendNextGate(selectedGate: GateDefinition | null, release?: ReleaseTransition): GateRecommendation {
  if (release?.currentState === "PROMOTION_PENDING") {
    return {
      recommendedNextGate: null,
      reason: `Repository promotion is pending. Resolve promotion blockers before starting another engineering gate: ${release.blockingConditions.join(", ") || "none"}.`,
    };
  }

  if (release?.currentState === "AUDIT_COMPLETE" && selectedGate?.next_gate) {
    return {
      recommendedNextGate: selectedGate.next_gate,
      reason: `${selectedGate.next_gate} is next because release audit is complete and it follows ${selectedGate.id} without skipping dependencies.`,
    };
  }

  if (!selectedGate) {
    return {
      recommendedNextGate: null,
      reason: "No eligible gate was selected, so PBOS recommends repairing gate dependencies or adding an approved gate.",
    };
  }

  if (!selectedGate.next_gate) {
    return {
      recommendedNextGate: null,
      reason: `${selectedGate.id} has no configured next gate.`,
    };
  }

  return {
    recommendedNextGate: selectedGate.next_gate,
    reason: `${selectedGate.next_gate} is next because it follows ${selectedGate.id} in the machine-readable gate sequence without skipping dependencies.`,
  };
}
