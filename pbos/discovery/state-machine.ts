import type { DiscoveryApproval, DiscoveryMachineState, DiscoveryState } from "./governed-contracts";
import { DiscoveryError, discoveryFailure } from "./errors";

const next: Record<DiscoveryState, DiscoveryState[]> = { OBSERVING: ["COLLECTING"], COLLECTING: ["VALIDATING"], VALIDATING: ["CLASSIFYING"], CLASSIFYING: ["REPORTING"], REPORTING: ["RECOMMENDING"], RECOMMENDING: ["GOVERNANCE_REVIEW"], GOVERNANCE_REVIEW: ["ARCHIVED"], ARCHIVED: [] };
export function transitionDiscovery(state: DiscoveryMachineState, to: DiscoveryState, transitionedAt: string, approval: DiscoveryApproval): DiscoveryMachineState {
  if (!next[state.currentState].includes(to)) throw new DiscoveryError([discoveryFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (to === "ARCHIVED" && (approval.status !== "approved" || !approval.approvalIdentifier || !approval.evidenceReferences.length)) throw new DiscoveryError([discoveryFailure("GOVERNANCE_BYPASS", "Archival after governance review requires recorded human approval.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, transitionedAt, approvalIdentifier: approval.approvalIdentifier, evidenceReferences: [...approval.evidenceReferences].sort() }] };
}
