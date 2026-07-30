export type MilestoneEligibilityState =
  | "READY"
  | "BLOCKED"
  | "WAITING_EXTERNAL_INPUT"
  | "NOT_READY"
  | "COMPLETED";

export interface MilestoneEligibilityAssessment {
  readonly milestone_id: string;
  readonly state: MilestoneEligibilityState;
  readonly prerequisites: readonly string[];
  readonly dependencies: readonly string[];
  readonly blockers: readonly string[];
  readonly risk: number;
  readonly strategic_importance: number;
  readonly implementation_readiness: number;
  readonly evidence: readonly string[];
  readonly digest: string;
}
