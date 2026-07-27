import { digestValue } from "../context";
import type { AutonomyApproval, AutonomyDecisionAudit, AutonomyMachineState, AutonomyRecommendation, AutonomyState, AutonomyTransition } from "./contracts";
import { AutonomyError } from "./observation";

const ALLOWED: Record<AutonomyState, AutonomyState[]> = {
  OBSERVING: ["ANALYZING"],
  ANALYZING: ["RECOMMENDING", "BLOCKED"],
  RECOMMENDING: ["WAITING_FOR_APPROVAL", "BLOCKED"],
  WAITING_FOR_APPROVAL: ["EXECUTING_APPROVED_WORK", "BLOCKED"],
  EXECUTING_APPROVED_WORK: ["VALIDATING", "BLOCKED"],
  VALIDATING: ["CERTIFYING", "BLOCKED"],
  CERTIFYING: ["RELEASING", "BLOCKED"],
  RELEASING: ["OBSERVING", "BLOCKED"],
  BLOCKED: ["OBSERVING"],
};

export function transitionAutonomy(state: AutonomyMachineState, to: AutonomyState, timestamp: string, approval: AutonomyApproval, evidenceReferences: string[]): AutonomyMachineState {
  if (!ALLOWED[state.currentState].includes(to)) throw new AutonomyError([{ code: "INVALID_TRANSITION", message: `${state.currentState} cannot transition to ${to}.` }]);
  if (to === "EXECUTING_APPROVED_WORK" && (approval.status !== "approved" || !approval.approvalIdentifier)) {
    throw new AutonomyError([{ code: "UNAUTHORIZED_EXECUTION", message: "Execution requires explicit human approval." }]);
  }
  if (Number.isNaN(Date.parse(timestamp)) || !evidenceReferences.length) throw new AutonomyError([{ code: "MISSING_EVIDENCE", message: "State transition evidence is required." }]);
  const transition: AutonomyTransition = { from: state.currentState, to, transitionedAt: timestamp, approvalIdentifier: approval.approvalIdentifier, evidenceReferences: [...evidenceReferences].sort() };
  return { currentState: to, transitions: [...state.transitions, transition] };
}

export function auditAutonomyDecision(recommendation: AutonomyRecommendation, approval: AutonomyApproval, lifecycleStage: AutonomyDecisionAudit["lifecycleStage"], transition: AutonomyTransition, observationTimestamp: string, inputContextDigest: string): AutonomyDecisionAudit {
  const body = { observationTimestamp, inputContextDigest, reasoningEvidence: [...recommendation.evidenceReferences], recommendation, approvalState: approval, lifecycleStage, resultingAction: recommendation.recommendedAction, stateTransition: transition };
  return { decisionId: `PBOS-AUTO-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
