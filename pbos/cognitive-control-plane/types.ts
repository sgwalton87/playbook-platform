export interface GovernedEvidenceReference {
  readonly id: string;
  readonly source: string;
  readonly digest: string;
  readonly observed_at: string;
}

export interface CognitiveRecommendation {
  readonly recommendation_id: string;
  readonly source_evidence: readonly GovernedEvidenceReference[];
  readonly confidence: number;
  readonly reasoning: readonly string[];
  readonly expected_impact: string;
  readonly human_review_required: true;
  readonly digest: string;
}

export interface CognitiveControlPlaneContext {
  readonly context_identity: string;
  readonly context_trusted: boolean;
  readonly authority_id: string;
  readonly timestamp: string;
}
