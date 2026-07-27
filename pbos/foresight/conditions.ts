import { digestValue } from "../context";
import type { FutureCondition, FutureConditionDraft } from "./contracts";

export function createFutureConditions(drafts: FutureConditionDraft[]): FutureCondition[] {
  return drafts
    .map((draft) => {
      const body = {
        ...draft,
        supportingEvidence: [...draft.supportingEvidence].sort(),
        contributingSignalIds: [...draft.contributingSignalIds].sort(),
        assumptions: [...draft.assumptions].sort(),
        possibleImpacts: [...draft.possibleImpacts].sort(),
        affectedStakeholders: [...draft.affectedStakeholders].sort(),
        limitations: [...draft.limitations].sort(),
        uncertaintyStatement: "This condition is a governed possibility, not a predicted or certain future state.",
      };
      return { conditionId: `PBOS-FOR-COND-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
    })
    .sort((left, right) => left.conditionId.localeCompare(right.conditionId));
}
