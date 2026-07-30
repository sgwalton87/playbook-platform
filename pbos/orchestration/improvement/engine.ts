import { artifactDigest } from "../../kernel/identity";
import type { ImprovementRecommendation } from "./types";

export class ContinuousImprovementEngine {
  recommend(input: Omit<ImprovementRecommendation, "recommendation_id" | "digest">): ImprovementRecommendation {
    if (!input.finding || input.evidence.length === 0 || input.confidence <= 0) {
      throw new Error("Improvement recommendation requires evidence.");
    }
    const body: ImprovementRecommendation = {
      ...input,
      evidence: [...new Set(input.evidence)].sort(),
      recommendation_id: `IMPROVEMENT-${artifactDigest(input).slice(0, 16)}`,
      digest: "",
    };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }
}
