export interface ImprovementRecommendation {
  readonly recommendation_id: string;
  readonly finding: string;
  readonly evidence: readonly string[];
  readonly impact: string;
  readonly recommended_action: string;
  readonly confidence: number;
  readonly timestamp: string;
  readonly digest: string;
}
