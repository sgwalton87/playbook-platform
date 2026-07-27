import type { EcosystemGovernanceAction } from "./contracts";
const routes: Record<EcosystemGovernanceAction, string> = { "relationship-acceptance": "relationship-participants", "mentorship-participation": "mentor-and-mentee", "institutional-partnership": "institutional-authority", "organizational-representation": "organization-authority" };
export const routeEcosystemGovernance = (actions: EcosystemGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
