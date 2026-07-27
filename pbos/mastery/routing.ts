import type { MasteryGovernanceAction } from "./contracts";
const routes: Record<MasteryGovernanceAction, string> = { "credential-approval": "credential-authority", "certification-decision": "certification-authority", "admissions-decision": "admissions-authority", "employment-decision": "employer-human-review", "opportunity-access": "access-governance" };
export const routeMasteryGovernance = (actions: MasteryGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
