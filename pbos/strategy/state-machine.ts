import type { StrategyApproval, StrategyMachineState, StrategyState } from "./contracts";
import { StrategyError, strategyFailure } from "./errors";

const next: Record<StrategyState, StrategyState[]> = { OBSERVING: ["ANALYZING"], ANALYZING: ["ALIGNING"], ALIGNING: ["MODELING_OPTIONS"], MODELING_OPTIONS: ["EVALUATING_TRADEOFFS"], EVALUATING_TRADEOFFS: ["REPORTING"], REPORTING: ["RECOMMENDING"], RECOMMENDING: ["GOVERNANCE_REVIEW"], GOVERNANCE_REVIEW: ["ARCHIVED"], ARCHIVED: [] };
export function transitionStrategy(state: StrategyMachineState, to: StrategyState, transitionedAt: string, approval: StrategyApproval): StrategyMachineState {
  if (!next[state.currentState].includes(to)) throw new StrategyError([strategyFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (to === "ARCHIVED" && (approval.status !== "approved" || !approval.approvalIdentifier || !approval.evidenceReferences.length)) throw new StrategyError([strategyFailure("GOVERNANCE_BYPASS", "Archival requires recorded human governance approval.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, transitionedAt, approvalIdentifier: approval.approvalIdentifier, evidenceReferences: [...approval.evidenceReferences].sort() }] };
}
