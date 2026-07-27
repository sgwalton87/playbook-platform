import type { CredentialGovernanceAction } from "./contracts";
const routes: Record<CredentialGovernanceAction, string> = { "credential-issuance": "authorized-issuer", "issuer-approval": "issuer-governance", "certification-recognition": "certification-authority", "institutional-recognition": "institutional-authority", "external-acceptance": "external-relying-party" };
export const routeCredentialGovernance = (actions: CredentialGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
