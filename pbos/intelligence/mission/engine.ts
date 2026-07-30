import { artifactDigest } from "../../kernel/identity";
import type {
  ImpactAssessment,
  MissionAlignmentAssessment,
  MissionObjective,
  StrategicGoal,
} from "./types";

export function assessMissionAlignment(input: {
  readonly objective: MissionObjective;
  readonly goals: readonly StrategicGoal[];
  readonly impact: ImpactAssessment;
  readonly scores: Omit<MissionAlignmentAssessment["score"], "total">;
}): MissionAlignmentAssessment {
  const goals = input.goals
    .filter(({ objective_id }) => objective_id === input.objective.id)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (
    !input.objective.owner ||
    input.objective.evidence.length === 0 ||
    goals.length === 0
  ) {
    throw new Error("Mission alignment evidence is incomplete.");
  }
  const values = Object.values(input.scores);
  if (values.some((value) => value < 0 || value > 100)) {
    throw new Error("Mission score is outside the governed range.");
  }
  const total = Math.round(
    input.scores.mission_alignment * 0.4 +
      input.scores.user_outcome * 0.25 +
      input.scores.business_value * 0.15 +
      input.scores.roadmap_readiness * 0.2
  );
  const body: MissionAlignmentAssessment = {
    objective_id: input.objective.id,
    goal_ids: goals.map(({ id }) => id),
    aligned: total >= 70,
    score: { ...input.scores, total },
    impact: input.impact,
    evidence: [...input.objective.evidence].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    reasoning: goals.map(({ statement }) => statement),
    confidence: Math.min(total, input.objective.evidence.length * 25),
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
