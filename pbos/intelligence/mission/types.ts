import type { GovernedEvidenceReference } from "../../cognitive-control-plane/types";

export interface MissionObjective {
  readonly id: string;
  readonly statement: string;
  readonly owner: string;
  readonly outcomes: readonly string[];
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface StrategicGoal {
  readonly id: string;
  readonly objective_id: string;
  readonly statement: string;
  readonly weight: number;
}

export interface PriorityScore {
  readonly mission_alignment: number;
  readonly user_outcome: number;
  readonly business_value: number;
  readonly roadmap_readiness: number;
  readonly total: number;
}

export interface ImpactAssessment {
  readonly expected_outcomes: readonly string[];
  readonly affected_populations: readonly string[];
  readonly uncertainty: readonly string[];
}

export interface MissionAlignmentAssessment {
  readonly objective_id: string;
  readonly goal_ids: readonly string[];
  readonly aligned: boolean;
  readonly score: PriorityScore;
  readonly impact: ImpactAssessment;
  readonly evidence: readonly GovernedEvidenceReference[];
  readonly reasoning: readonly string[];
  readonly confidence: number;
  readonly digest: string;
}
