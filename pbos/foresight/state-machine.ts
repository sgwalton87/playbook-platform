import type { ForesightApproval, ForesightMachineState, ForesightState } from "./contracts";
import { ForesightError, foresightFailure } from "./errors";

const transitions: Record<ForesightState, ForesightState[]> = {
  OBSERVING: ["COLLECTING_SIGNALS"],
  COLLECTING_SIGNALS: ["ANALYZING_PATTERNS"],
  ANALYZING_PATTERNS: ["ASSESSING_HORIZONS"],
  ASSESSING_HORIZONS: ["MODELING_FUTURE_CONDITIONS"],
  MODELING_FUTURE_CONDITIONS: ["IDENTIFYING_PREPARATION_AREAS"],
  IDENTIFYING_PREPARATION_AREAS: ["REPORTING"],
  REPORTING: ["GOVERNANCE_REVIEW"],
  GOVERNANCE_REVIEW: ["ARCHIVED"],
  ARCHIVED: [],
};

export function transitionForesight(
  state: ForesightMachineState,
  to: ForesightState,
  transitionedAt: string,
  approval: ForesightApproval,
): ForesightMachineState {
  if (!transitions[state.currentState].includes(to)) {
    throw new ForesightError([foresightFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  }
  if (to === "ARCHIVED" && (approval.status !== "approved" || !approval.approvalIdentifier || !approval.evidenceReferences.length)) {
    throw new ForesightError([foresightFailure("GOVERNANCE_BYPASS", "Archival requires recorded human governance approval.")]);
  }
  return {
    currentState: to,
    transitions: [...state.transitions, {
      from: state.currentState,
      to,
      transitionedAt,
      approvalIdentifier: approval.approvalIdentifier,
      evidenceReferences: [...approval.evidenceReferences].sort(),
    }],
  };
}
