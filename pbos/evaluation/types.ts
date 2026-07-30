import type { GovernedEvidenceReference } from "../cognitive-control-plane/types";

export interface OutcomeMeasurement {
  readonly id: string;
  readonly objective_id: string;
  readonly metric: string;
  readonly baseline: number;
  readonly observed: number;
  readonly target: number;
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface ImpactAssessment {
  readonly technical_improvement: string;
  readonly mission_alignment: string;
  readonly user_outcomes: string;
  readonly system_health: string;
  readonly long_term_value: string;
}

export interface LearningSignal {
  readonly finding: string;
  readonly direction: "POSITIVE" | "NEGATIVE" | "INCONCLUSIVE";
  readonly confidence: number;
}

export interface ImprovementRecommendation {
  readonly action: string;
  readonly evidence_ids: readonly string[];
  readonly human_review_required: true;
}

export interface OutcomeEvaluation {
  readonly measurement: OutcomeMeasurement;
  readonly impact: ImpactAssessment;
  readonly signal: LearningSignal;
  readonly recommendation: ImprovementRecommendation;
  readonly status: "IMPROVED" | "REGRESSED" | "INCONCLUSIVE";
  readonly digest: string;
}
