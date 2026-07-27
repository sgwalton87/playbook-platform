import type { AthleticLifecycleState, AthleticState } from "./contracts";
import { AthleticError, athleticFailure } from "./errors";
const next: Record<AthleticState, AthleticState[]> = { CREATED: ["DEVELOPING"], DEVELOPING: ["SHOWCASE_READY"], SHOWCASE_READY: ["OPPORTUNITY_SEARCH"], OPPORTUNITY_SEARCH: ["CONNECTED"], CONNECTED: ["TRANSITIONING", "ACTIVE"], TRANSITIONING: ["ACTIVE", "POST_ATHLETIC"], ACTIVE: ["POST_ATHLETIC"], POST_ATHLETIC: ["ARCHIVED"], ARCHIVED: [] };
export function transitionAthletic(state: AthleticLifecycleState, to: AthleticState, transitionedAt: string, authorityIdentity: string, evidenceReferences: string[]): AthleticLifecycleState {
  if (!next[state.currentState].includes(to)) throw new AthleticError([athleticFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (["SHOWCASE_READY", "CONNECTED", "TRANSITIONING", "ACTIVE", "POST_ATHLETIC", "ARCHIVED"].includes(to) && (!authorityIdentity || !evidenceReferences.length)) throw new AthleticError([athleticFailure("GOVERNANCE_BYPASS", "Showcase, connection, transition, active, and archival stages require human authority and evidence.")]);
  if (Number.isNaN(Date.parse(transitionedAt))) throw new AthleticError([athleticFailure("MISSING_EVIDENCE", "Lifecycle transitions require a valid timestamp.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, transitionedAt, authorityIdentity, evidenceReferences: [...evidenceReferences].sort() }] };
}
