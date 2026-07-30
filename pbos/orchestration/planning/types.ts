export interface GovernedPlanRecommendation {
  readonly plan_id: string;
  readonly recommended_milestone: string | null;
  readonly reason: readonly string[];
  readonly dependencies: readonly string[];
  readonly risk: number;
  readonly impact: string;
  readonly confidence: number;
  readonly blocking_conditions: readonly string[];
  readonly evidence_references: readonly string[];
  readonly authority: "PBOS-CONSTITUTIONAL-PLANNER";
  readonly timestamp: string;
  readonly digest: string;
}
