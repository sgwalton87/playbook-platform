import type { SimulationAuthorityChange } from "./contracts";
const routes: Record<SimulationAuthorityChange, string> = { "strategic-commitment": "executive-leadership", "resource-commitment": "resource-owner", "external-decision": "external-commitment-authority", "policy-change": "policy-governance", "constitutional-implication": "constitutional-governance" };
export const routeSimulationGovernance = (changes: SimulationAuthorityChange[]): string[] => [...new Set(changes.map((change) => routes[change]))].sort();
