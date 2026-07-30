import { artifactDigest } from "../../kernel/identity";
import type { KernelInput, KernelResult } from "../../kernel/execution";
import type { MilestoneEligibilityAssessment } from "../dependency-engine";
import type { NextMilestoneRecommendation } from "./types";

export function recommendCanonicalMilestone(
  input: KernelInput,
  result: KernelResult,
  assessments: readonly MilestoneEligibilityAssessment[]
): NextMilestoneRecommendation {
  const selectedId = result.decision.selectedObjectiveId;
  const selected = assessments.find(
    ({ milestone_id }) => milestone_id === selectedId
  );
  const assessedBlockers = selectedId
    ? selected?.blockers ?? ["Canonical selection has no eligibility assessment."]
    : assessments
        .filter(({ state }) => state !== "COMPLETED")
        .flatMap(({ milestone_id, blockers: reasons }) =>
          reasons.length > 0
            ? reasons.map((reason) => `${milestone_id}:${reason}`)
            : [`${milestone_id}:${result.certification.status}`]
        )
        .sort();
  const blockers =
    assessedBlockers.length > 0
      ? assessedBlockers
      : [...result.certification.findings].sort();
  const body: NextMilestoneRecommendation = {
    recommendation_id: `RECOMMENDATION-${result.decision.digest.slice(0, 16)}`,
    recommended_milestone: selectedId,
    reason: [...result.decision.rationale],
    dependencies_satisfied: selected?.state === "READY",
    risk: selected?.risk ?? 100,
    impact: selectedId
      ? "Advance the canonical constitutional dependency path."
      : "Resolve governance blockers before development proceeds.",
    confidence:
      selected?.state === "READY" &&
      result.certification.status === "CERTIFIED"
        ? 100
        : 0,
    blocking_conditions: blockers,
    evidence: [
      input.constitution.digest,
      input.registry.digest,
      result.decision.digest,
      result.certification.digest,
    ].sort(),
    authority: "PBOS-CONSTITUTIONAL-PLANNER",
    timestamp: input.observedAt,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
