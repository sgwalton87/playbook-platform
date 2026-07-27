import type { IdentityGovernanceAction } from "./contracts";
const routes: Record<IdentityGovernanceAction, string> = { "identity-verification": "authorized-identity-reviewer", "consent-decision": "person-owner", "data-sharing": "person-owner", "external-access": "person-owner-and-recipient", "identity-correction": "person-owner-and-authorized-reviewer" };
export const routeIdentityGovernance = (actions: IdentityGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
