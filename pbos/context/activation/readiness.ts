import { artifactDigest } from "../../kernel/identity";
import type { RepositoryRealityAssessment } from "../reconciliation";
import type { TrustedBuildContext } from "./types";

export interface PBOSAutonomousReadinessAssessment {
  readonly assessment_id: string;
  readonly current_capability_level: "BLOCKED" | "GOVERNED_PLANNING";
  readonly approved_capabilities: readonly string[];
  readonly remaining_restrictions: readonly string[];
  readonly next_eligible_milestone: string | null;
  readonly timestamp: string;
  readonly digest: string;
}

export function assessAutonomousReadiness(input: {
  readonly context: TrustedBuildContext | null;
  readonly repository: RepositoryRealityAssessment;
  readonly timestamp: string;
  readonly nextEligibleMilestone?: string | null;
}): PBOSAutonomousReadinessAssessment {
  const contextCurrent =
    input.context !== null &&
    input.context.repository_identity === input.repository.repository_identity &&
    input.context.commit_identity === input.repository.current_commit &&
    input.context.manifest_digest === input.repository.manifest_digest &&
    input.context.artifact_digest === input.repository.artifact_digest &&
    input.context.architecture_digest === input.repository.architecture_digest &&
    Date.parse(input.context.expiration_timestamp) > Date.parse(input.timestamp);
  const ready =
    contextCurrent &&
    input.repository.recommendation === "ACTIVATION_ELIGIBLE";
  const body = {
    assessment_id: `AUTONOMOUS-READINESS-${artifactDigest({
      context: input.context?.digest ?? null,
      repository: input.repository.digest,
    }).slice(0, 16)}`,
    current_capability_level: ready ? "GOVERNED_PLANNING" as const : "BLOCKED" as const,
    approved_capabilities: ready
      ? ["ANALYZE", "RECOMMEND", "PLAN", "PACKAGE", "ASSIGN_AFTER_AUTHORIZATION"]
      : [],
    remaining_restrictions: ready
      ? ["Human authorization remains mandatory.", "Production activation is prohibited."]
      : [
          "Trusted build context is absent, expired, or does not match repository reality.",
          "Planning and execution admission remain blocked.",
        ],
    next_eligible_milestone: ready ? input.nextEligibleMilestone ?? null : null,
    timestamp: input.timestamp,
  };
  return { ...body, digest: artifactDigest(body) };
}
