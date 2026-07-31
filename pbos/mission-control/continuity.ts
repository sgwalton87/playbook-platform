import { loadMilestoneAdvancementHistory } from "../execution/evidence";
import { loadMasterBuildManifest } from "../manifests";

export interface RoadmapContinuityView {
  readonly objective: string;
  readonly current_completed_milestone: string | null;
  readonly next_eligible_milestone: string | null;
  readonly status: "READY" | "COMPLETE" | "BLOCKED";
}

export function resolveRoadmapContinuity(
  rootDir: string,
  nextMilestone: string | null
): RoadmapContinuityView {
  const manifest = loadMasterBuildManifest(rootDir).manifest;
  const advancement = loadMilestoneAdvancementHistory(rootDir);
  const completed = advancement?.latest.milestone_id ?? null;
  const remaining = manifest.milestones.some(
    ({ id, status }) =>
      !["COMPLETE", "ARCHIVED"].includes(status) &&
      ![...(advancement?.history ?? []), ...(advancement ? [advancement.latest] : [])]
        .some(({ milestone_id }) => milestone_id === id)
  );
  return {
    objective: `Build ${manifest.program}`,
    current_completed_milestone: completed,
    next_eligible_milestone: nextMilestone,
    status: nextMilestone ? "READY" : remaining ? "BLOCKED" : "COMPLETE",
  };
}

export function formatRoadmapContinuity(view: RoadmapContinuityView): string {
  return [
    "PBOS MISSION CONTROL",
    "",
    "Objective:",
    view.objective,
    "",
    "Current Completed Milestone:",
    view.current_completed_milestone ?? "NONE",
    "",
    "Next Eligible Milestone:",
    view.next_eligible_milestone ?? "NONE",
    "",
    "Status:",
    view.status,
  ].join("\n");
}
