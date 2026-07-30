import type { GovernedEvidenceReference } from "../cognitive-control-plane/types";

export interface SimulationRequest {
  readonly id: string;
  readonly requested_by: string;
  readonly scenario: string;
  readonly context_digest: string;
  readonly dependencies: readonly string[];
  readonly assumptions: readonly string[];
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface ImpactProjection {
  readonly domain: string;
  readonly expected: string;
  readonly adverse: string;
  readonly confidence: number;
}

export interface RollbackPlan {
  readonly owner: string;
  readonly trigger_conditions: readonly string[];
  readonly steps: readonly string[];
  readonly validation: readonly string[];
}

export interface SimulationResult {
  readonly id: string;
  readonly request_digest: string;
  readonly projections: readonly ImpactProjection[];
  readonly rollback: RollbackPlan;
  readonly limitations: readonly string[];
  readonly evidence: readonly GovernedEvidenceReference[];
  readonly confidence: number;
  readonly production_authority: false;
  readonly digest: string;
}
