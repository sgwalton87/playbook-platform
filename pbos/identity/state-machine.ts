import type { IdentityLifecycleState, IdentityState } from "./contracts";
import { IdentityError, identityFailure } from "./errors";
const next: Record<IdentityState, IdentityState[]> = { CREATED: ["VERIFYING"], VERIFYING: ["VERIFIED"], VERIFIED: ["ACTIVE"], ACTIVE: ["SHARING_AUTHORIZED"], SHARING_AUTHORIZED: ["TRANSFER_REQUESTED", "ARCHIVED"], TRANSFER_REQUESTED: ["ARCHIVED"], ARCHIVED: [] };
export function transitionIdentity(state: IdentityLifecycleState, to: IdentityState, transitionedAt: string, authorityIdentity: string, evidenceReferences: string[]): IdentityLifecycleState {
  if (!next[state.currentState].includes(to)) throw new IdentityError([identityFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (["VERIFIED", "SHARING_AUTHORIZED", "TRANSFER_REQUESTED", "ARCHIVED"].includes(to) && (!authorityIdentity || !evidenceReferences.length)) throw new IdentityError([identityFailure("GOVERNANCE_BYPASS", "Verification, sharing, transfer, and archival require human authority and evidence.")]);
  if (Number.isNaN(Date.parse(transitionedAt))) throw new IdentityError([identityFailure("MISSING_PROVENANCE", "Lifecycle transitions require a valid timestamp.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, transitionedAt, authorityIdentity, evidenceReferences: [...evidenceReferences].sort() }] };
}
