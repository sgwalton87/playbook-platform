export interface NextMilestoneRecommendation {
  readonly recommendation_id: string;
  readonly recommended_milestone: string | null;
  readonly reason: readonly string[];
  readonly dependencies_satisfied: boolean;
  readonly risk: number;
  readonly impact: string;
  readonly confidence: number;
  readonly blocking_conditions: readonly string[];
  readonly evidence: readonly string[];
  readonly authority: "PBOS-CONSTITUTIONAL-PLANNER";
  readonly timestamp: string;
  readonly digest: string;
}
