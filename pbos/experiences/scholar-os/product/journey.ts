import { artifactDigest } from "../../../kernel/identity";
import type { JourneyProgress, ScholarJourney } from "./types";

export function buildScholarJourney(
  input: Omit<ScholarJourney, "progress" | "digest">
): ScholarJourney {
  if (
    !input.scholar_id ||
    input.current_reality_evidence.length === 0 ||
    input.goals.some(
      ({ scholar_id, owner_confirmed, evidence_ids }) =>
        scholar_id !== input.scholar_id ||
        !owner_confirmed ||
        evidence_ids.length === 0
    ) ||
    input.actions.some(
      ({ evidence_ids, reasoning, confidence }) =>
        evidence_ids.length === 0 ||
        reasoning.length === 0 ||
        confidence < 0 ||
        confidence > 100
    )
  ) {
    throw new Error("Scholar journey truth or agency requirements are invalid.");
  }
  const progress: JourneyProgress[] = input.goals.map((goal) => {
    const milestones = input.milestones.filter(({ goal_id }) => goal_id === goal.id);
    const completed = milestones.filter(({ status }) => status === "ACHIEVED").length;
    return {
      goal_id: goal.id,
      completed_milestones: completed,
      total_milestones: milestones.length,
      percent:
        milestones.length === 0
          ? 0
          : Math.round((completed / milestones.length) * 100),
      outcome_evidence_ids: milestones.flatMap(({ evidence_ids }) => evidence_ids),
    };
  });
  const body: ScholarJourney = {
    ...input,
    goals: [...input.goals].sort((a, b) => a.id.localeCompare(b.id)),
    milestones: [...input.milestones].sort((a, b) => a.id.localeCompare(b.id)),
    actions: [...input.actions].sort((a, b) => a.id.localeCompare(b.id)),
    progress,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
