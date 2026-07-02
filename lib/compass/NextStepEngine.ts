import type { CompassRecommendation } from "./types";

export function buildNextActions(recommendations: CompassRecommendation[]) {
  return Array.from(
    new Set(recommendations.flatMap(rec => rec.nextSteps))
  ).slice(0, 6);
}
