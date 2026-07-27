import type { MetaApproval, MetaMachineState, MetaState, MetaTransition } from "./contracts";
import { MetaIntelligenceError, metaFailure } from "./errors";

const ALLOWED: Record<MetaState, MetaState[]> = {
  OBSERVING: ["ANALYZING"],
  ANALYZING: ["REPORTING"],
  REPORTING: ["RECOMMENDING"],
  RECOMMENDING: ["GOVERNANCE_REVIEW"],
  GOVERNANCE_REVIEW: ["ARCHIVED"],
  ARCHIVED: ["OBSERVING"],
};

export function transitionMeta(state: MetaMachineState, to: MetaState, timestamp: string, approval: MetaApproval, evidenceReferences: string[]): MetaMachineState {
  if (!ALLOWED[state.currentState].includes(to)) throw new MetaIntelligenceError([metaFailure("INVALID_TRANSITION", `${state.currentState} cannot transition to ${to}.`)]);
  if (to === "ARCHIVED" && (approval.status !== "approved" || !approval.approvalIdentifier)) throw new MetaIntelligenceError([metaFailure("GOVERNANCE_BYPASS", "Archival after governance review requires explicit approval.")]);
  if (Number.isNaN(Date.parse(timestamp)) || !evidenceReferences.length) throw new MetaIntelligenceError([metaFailure("INVALID_EVIDENCE", "Meta transitions require timestamped evidence.")]);
  const transition: MetaTransition = { from: state.currentState, to, transitionedAt: timestamp, approvalIdentifier: approval.approvalIdentifier, evidenceReferences: [...evidenceReferences].sort() };
  return { currentState: to, transitions: [...state.transitions, transition] };
}
