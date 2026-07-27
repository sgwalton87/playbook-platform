import type { StrategyAuthorityType } from "./contracts";

const routes: Record<StrategyAuthorityType, string> = {
  "strategic-priority": "executive-leadership", "resource-commitment": "resource-owner", "organizational-direction": "organizational-governance",
  "constitutional-interpretation": "constitutional-governance", "major-investment": "investment-authority", "external-commitment": "external-commitment-authority",
};
export const routeStrategyApprovals = (types: StrategyAuthorityType[]): string[] => [...new Set(types.map((type) => routes[type]))].sort();
