import type { AcademicGovernanceAction } from "./contracts";
const routes: Record<AcademicGovernanceAction, string> = { grade: "institutional-grading-authority", transcript: "institutional-records-authority", "institutional-record": "institutional-records-authority", "admissions-decision": "institutional-admissions-authority", "eligibility-decision": "eligibility-authority", "graduation-decision": "institutional-graduation-authority" };
export const routeAcademicGovernance = (actions: AcademicGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
