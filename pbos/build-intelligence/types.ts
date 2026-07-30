import type { PBOSSystemAssessment } from "../orchestration/intelligence";

export interface PBOSBuildRealityAssessment {
  readonly current_maturity: PBOSSystemAssessment["current_maturity"];
  readonly completed_systems: readonly string[];
  readonly incomplete_systems: readonly string[];
  readonly blocked_systems: readonly string[];
  readonly recommended_next_milestone: string | null;
  readonly confidence: number;
  readonly reasoning: readonly string[];
  readonly manifest_digest: string;
  readonly system_assessment_digest: string;
  readonly digest: string;
}
