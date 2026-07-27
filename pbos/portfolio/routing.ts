import type { PortfolioGovernanceAction } from "./contracts";
const routes: Record<PortfolioGovernanceAction, string> = { "ownership-decision": "person-owner", sharing: "person-owner", "external-presentation": "person-owner-and-recipient", correction: "person-owner-and-verification-authority", verification: "approved-human-reviewer" };
export const routePortfolioGovernance = (actions: PortfolioGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
