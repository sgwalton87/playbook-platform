import type { LearningGovernanceAction } from "./contracts";
const routes: Record<LearningGovernanceAction, string> = { "educational-decision": "educator-or-mentor", evaluation: "authorized-evaluator", certification: "certification-authority", "disciplinary-decision": "disciplinary-authority", "access-opportunity": "access-governance" };
export const routeLearningGovernance = (actions: LearningGovernanceAction[]): string[] => [...new Set(actions.map((action) => routes[action]))].sort();
