import type { CommunicationLifecycle, CommunicationState } from "./contracts";
import { CommunicationError, communicationFailure } from "./errors";
const next: Record<CommunicationState, CommunicationState[]> = { CREATED: ["AUTHORIZED"], AUTHORIZED: ["SENT"], SENT: ["DELIVERED"], DELIVERED: ["ACKNOWLEDGED"], ACKNOWLEDGED: ["ARCHIVED"], ARCHIVED: [] };
export function transitionCommunication(state: CommunicationLifecycle, to: CommunicationState, timestamp: string, actorIdentity: string, evidenceReferences: string[]): CommunicationLifecycle {
  if (!next[state.currentState].includes(to)) throw new CommunicationError([communicationFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (!actorIdentity || !evidenceReferences.length || Number.isNaN(Date.parse(timestamp))) throw new CommunicationError([communicationFailure("GOVERNANCE_BYPASS", "Communication transitions require an identified actor, evidence, and valid timestamp.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, timestamp, actorIdentity, evidenceReferences: [...evidenceReferences].sort() }] };
}
