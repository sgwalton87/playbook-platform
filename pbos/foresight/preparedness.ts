import { digestValue } from "../context";
import type { FutureCondition, PreparednessDraft, PreparednessOpportunity } from "./contracts";
import { routePreparednessGovernance } from "./routing";

export function createPreparednessOpportunities(
  drafts: PreparednessDraft[],
  conditions: FutureCondition[],
): PreparednessOpportunity[] {
  const byDescription = new Map(conditions.map((condition) => [condition.description, condition]));
  return drafts
    .map((draft) => {
      const condition = byDescription.get(draft.futureConditionDescription);
      if (!condition) {
        throw new Error(`Preparedness condition is not modeled: ${draft.futureConditionDescription}`);
      }
      const body = {
        ...draft,
        supportingEvidence: [...draft.supportingEvidence].sort(),
        recommendedQuestions: [...draft.recommendedQuestions].sort(),
        resourcesToEvaluate: [...draft.resourcesToEvaluate].sort(),
        risks: [...draft.risks].sort(),
        requiredAuthority: [...draft.requiredAuthority].sort(),
        futureConditionId: condition.conditionId,
        requiredApprovals: routePreparednessGovernance(draft.requiredAuthority),
        advisoryOnly: true as const,
        commitmentCreated: false as const,
      };
      return { preparednessId: `PBOS-FOR-PREP-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
    })
    .sort((left, right) => left.preparednessId.localeCompare(right.preparednessId));
}
