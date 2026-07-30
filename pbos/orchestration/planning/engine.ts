import { artifactDigest } from "../../kernel/identity";
import type { MilestoneEligibilityAssessment } from "../dependency-engine";
import type { PBOSSystemAssessment } from "../intelligence";
import type { NextMilestoneRecommendation } from "../recommendation";
import type { GovernedPlanRecommendation } from "./types";

export class GovernedPlanningEngine {
  recommend(input: {
    readonly assessment: PBOSSystemAssessment;
    readonly canonical: NextMilestoneRecommendation;
    readonly eligibility: readonly MilestoneEligibilityAssessment[];
  }): GovernedPlanRecommendation {
    const selected = input.eligibility.find(
      ({ milestone_id }) =>
        milestone_id === input.canonical.recommended_milestone
    );
    const assessmentBlocked = input.assessment.current_maturity === "BLOCKED";
    const eligible = selected?.state === "READY" && !assessmentBlocked;
    const milestone = eligible
      ? input.canonical.recommended_milestone
      : null;
    const blockers = [
      ...input.canonical.blocking_conditions,
      ...(assessmentBlocked
        ? input.assessment.risks.length > 0
          ? input.assessment.risks
          : ["System assessment is blocked."]
        : []),
      ...(input.canonical.recommended_milestone && !selected
        ? ["Canonical milestone has no eligibility assessment."]
        : []),
    ].filter((value, index, values) => values.indexOf(value) === index).sort();
    const body: GovernedPlanRecommendation = {
      plan_id: `GOVERNED-PLAN-${input.canonical.digest.slice(0, 16)}`,
      recommended_milestone: milestone,
      reason: [...input.canonical.reason],
      dependencies: selected?.dependencies ?? [],
      risk: selected?.risk ?? 100,
      impact: input.canonical.impact,
      confidence: milestone ? input.canonical.confidence : 0,
      blocking_conditions: blockers,
      evidence_references: [
        input.assessment.digest,
        input.canonical.digest,
        ...(selected ? [selected.digest, ...selected.evidence] : []),
      ].sort(),
      authority: "PBOS-CONSTITUTIONAL-PLANNER",
      timestamp: input.canonical.timestamp,
      digest: "",
    };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }
}
