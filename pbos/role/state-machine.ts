import type { RoleLifecycleState, RoleState } from "./contracts";
import { RoleError, roleFailure } from "./errors";
const next: Record<RoleState, RoleState[]> = { REQUESTED: ["VERIFYING"], VERIFYING: ["APPROVED"], APPROVED: ["ACTIVE"], ACTIVE: ["SUSPENDED", "REVOKED"], SUSPENDED: ["ACTIVE", "REVOKED"], REVOKED: ["ARCHIVED"], ARCHIVED: [] };
export function transitionRole(state: RoleLifecycleState, to: RoleState, transitionedAt: string, authorityIdentity: string, evidenceReferences: string[]): RoleLifecycleState {
  if (!next[state.currentState].includes(to)) throw new RoleError([roleFailure("INVALID_TRANSITION", `Cannot transition from ${state.currentState} to ${to}.`)]);
  if (["APPROVED", "ACTIVE", "SUSPENDED", "REVOKED", "ARCHIVED"].includes(to) && (!authorityIdentity || !evidenceReferences.length)) throw new RoleError([roleFailure("GOVERNANCE_BYPASS", "Governed role transitions require human authority and evidence.")]);
  if (Number.isNaN(Date.parse(transitionedAt))) throw new RoleError([roleFailure("MISSING_EVIDENCE", "Role transitions require a valid timestamp.")]);
  return { currentState: to, transitions: [...state.transitions, { from: state.currentState, to, transitionedAt, authorityIdentity, evidenceReferences: [...evidenceReferences].sort() }] };
}
