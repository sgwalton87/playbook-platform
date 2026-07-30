import type { GovernedEvidenceReference } from "../../cognitive-control-plane/types";

export interface DecisionRationale {
  readonly summary: string;
  readonly assumptions: readonly string[];
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface RejectedAlternative {
  readonly id: string;
  readonly description: string;
  readonly rejection_reason: string;
}

export interface TradeoffRecord {
  readonly benefit: string;
  readonly cost: string;
  readonly accepted_by: string;
}

export interface LessonLearned {
  readonly finding: string;
  readonly outcome_evidence: readonly GovernedEvidenceReference[];
  readonly confidence: number;
}

export interface ArchitectureDecisionRecord {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly authority: string;
  readonly status: "PROPOSED" | "ACCEPTED" | "REJECTED" | "SUPERSEDED";
  readonly rationale: DecisionRationale;
  readonly alternatives: readonly RejectedAlternative[];
  readonly tradeoffs: readonly TradeoffRecord[];
  readonly lessons: readonly LessonLearned[];
  readonly supersedes: string | null;
  readonly timestamp: string;
  readonly digest: string;
}
