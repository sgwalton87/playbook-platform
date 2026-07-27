import type { AdaptationApproval, AdaptationMachineState, AdaptationState, AdaptationTransition } from "./contracts";
import { AdaptationError, adaptationFailure } from "./errors";

const ALLOWED: Record<AdaptationState, AdaptationState[]> = {
  OBSERVING: ["ANALYZING", "BLOCKED"],
  ANALYZING: ["PATTERN_IDENTIFIED", "BLOCKED"],
  PATTERN_IDENTIFIED: ["PROPOSAL_CREATED", "BLOCKED"],
  PROPOSAL_CREATED: ["GOVERNANCE_REVIEW", "BLOCKED"],
  GOVERNANCE_REVIEW: ["APPROVED_CHANGE", "REJECTED", "BLOCKED"],
  APPROVED_CHANGE: ["LIFECYCLE_EXECUTION", "BLOCKED"],
  LIFECYCLE_EXECUTION: ["VALIDATION", "BLOCKED"],
  VALIDATION: ["CERTIFICATION", "REJECTED", "BLOCKED"],
  CERTIFICATION: ["RELEASE", "REJECTED", "BLOCKED"],
  RELEASE: ["OBSERVING", "BLOCKED"],
  REJECTED: ["OBSERVING"],
  BLOCKED: ["OBSERVING"],
};

export function transitionAdaptation(state: AdaptationMachineState, to: AdaptationState, timestamp: string, approval: AdaptationApproval, evidenceReferences: string[]): AdaptationMachineState {
  if (!ALLOWED[state.currentState].includes(to)) throw new AdaptationError([adaptationFailure("INVALID_TRANSITION", `${state.currentState} cannot transition to ${to}.`)]);
  if ((to === "APPROVED_CHANGE" || to === "LIFECYCLE_EXECUTION") && (approval.status !== "approved" || !approval.approvalIdentifier)) {
    throw new AdaptationError([adaptationFailure("GOVERNANCE_BYPASS", "Approved change and lifecycle execution require explicit human approval.")]);
  }
  if (Number.isNaN(Date.parse(timestamp)) || !evidenceReferences.length) throw new AdaptationError([adaptationFailure("MISSING_EVIDENCE", "Transitions require timestamped evidence.")]);
  const transition: AdaptationTransition = { from: state.currentState, to, transitionedAt: timestamp, approvalIdentifier: approval.approvalIdentifier, evidenceReferences: [...evidenceReferences].sort() };
  return { currentState: to, transitions: [...state.transitions, transition] };
}
