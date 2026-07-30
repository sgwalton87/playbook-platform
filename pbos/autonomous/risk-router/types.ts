import type { BuildRiskLevel } from "../../manifests";

export interface AutonomousRiskDecision {
  readonly milestone_id: string;
  readonly risk: BuildRiskLevel;
  readonly route: "AUTOMATICALLY_ELIGIBLE" | "FOUNDER_REVIEW" | "MANDATORY_APPROVAL";
  readonly authority_required: "POLICY" | "HUMAN" | "EXPLICIT_HUMAN";
  readonly reasons: readonly string[];
  readonly digest: string;
}
