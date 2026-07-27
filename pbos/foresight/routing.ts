import type { PreparednessAuthority } from "./contracts";

const routes: Record<PreparednessAuthority, string> = {
  "strategic-direction": "executive-leadership",
  investment: "investment-authority",
  "resource-commitment": "resource-owner",
  "organizational-commitment": "organizational-governance",
  "policy-change": "policy-governance",
  "constitutional-implication": "constitutional-governance",
};

export function routePreparednessGovernance(authorities: PreparednessAuthority[]): string[] {
  return [...new Set(authorities.map((authority) => routes[authority]))].sort();
}
