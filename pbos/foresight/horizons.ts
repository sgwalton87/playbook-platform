import { digestValue } from "../context";
import type { ForesightTrend, HorizonAnalysis, HorizonType } from "./contracts";

const horizonOrder: HorizonType[] = ["NEAR_TERM", "MEDIUM_TERM", "LONG_TERM"];

export function analyzeHorizons(
  trends: ForesightTrend[],
  definitions: Record<HorizonType, string>,
): HorizonAnalysis[] {
  return horizonOrder.map((horizon) => {
    const relevant = trends.filter((trend) => trend.timeframe === horizon);
    const body = {
      horizon,
      timeframeDefinition: definitions[horizon],
      evidenceBasis: [...new Set(relevant.flatMap((trend) => trend.supportingEvidence))].sort(),
      uncertaintyStatement: "A time horizon organizes attention; it does not establish whether or when a condition will occur.",
      limitations: ["Horizon placement is analytical and does not express probability.", ...relevant.flatMap((trend) => trend.limitations)].sort(),
    };
    return { horizonId: `PBOS-FOR-HOR-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  });
}
