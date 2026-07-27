import type { OpportunityGovernanceAction } from "./contracts";
const routes: Record<OpportunityGovernanceAction, string> = { admissions: "admissions-authority", hiring: "employer-human-review", "scholarship-selection": "scholarship-selection-authority", "program-acceptance": "program-authority", "employment-decision": "employer-human-review" };
export const routeOpportunityGovernance = (actions: OpportunityGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
