import { digestValue } from "../context";
import type { ForesightTrend, TrendDraft } from "./contracts";

export function createTrends(drafts: TrendDraft[]): ForesightTrend[] {
  return drafts
    .map((draft) => {
      const body = {
        ...draft,
        supportingEvidence: [...draft.supportingEvidence].sort(),
        originatingSignalIds: [...draft.originatingSignalIds].sort(),
        historicalReferences: [...draft.historicalReferences].sort(),
        affectedDomains: [...draft.affectedDomains].sort(),
        limitations: [...draft.limitations].sort(),
        confidenceClassification: draft.supportingEvidence.length > 2 ? "HIGH" as const : "MEDIUM" as const,
        classification: "TREND_NOT_PREDICTION" as const,
      };
      return { trendId: `PBOS-FOR-TREND-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
    })
    .sort((left, right) => left.trendId.localeCompare(right.trendId));
}
