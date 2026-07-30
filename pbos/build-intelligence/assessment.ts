import { artifactDigest } from "../kernel/identity";
import type { LoadedBuildManifest } from "../manifests";
import type { PBOSSystemAssessment } from "../orchestration/intelligence";
import type { GovernedPlanRecommendation } from "../orchestration/planning";
import type { PBOSBuildRealityAssessment } from "./types";

export function assessBuildReality(
  manifest: LoadedBuildManifest,
  system: PBOSSystemAssessment,
  recommendation: GovernedPlanRecommendation
): PBOSBuildRealityAssessment {
  const completed = manifest.manifest.milestones
    .filter(({ status }) => status === "COMPLETE" || status === "ARCHIVED")
    .map(({ id }) => id)
    .sort();
  const blocked = manifest.manifest.milestones
    .filter(({ status, blocking_dependencies }) =>
      status === "BLOCKED" || blocking_dependencies.length > 0
    )
    .map(({ id }) => id)
    .sort();
  const incomplete = manifest.manifest.milestones
    .filter(({ status }) => status !== "COMPLETE" && status !== "ARCHIVED")
    .map(({ id }) => id)
    .sort();
  const body = {
    current_maturity: system.current_maturity,
    completed_systems: completed,
    incomplete_systems: incomplete,
    blocked_systems: blocked,
    recommended_next_milestone: recommendation.recommended_milestone,
    confidence: recommendation.confidence,
    reasoning:
      system.current_maturity === "BLOCKED" && system.risks.length > 0
        ? [...system.risks]
        : recommendation.recommended_milestone
          ? [...recommendation.reason]
          : [...recommendation.blocking_conditions],
    manifest_digest: manifest.digest,
    system_assessment_digest: system.digest,
  };
  return { ...body, digest: artifactDigest(body) };
}
