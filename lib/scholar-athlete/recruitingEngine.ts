export type RecruitingStage =
  | "researching"
  | "watchlist"
  | "contacted"
  | "conversation"
  | "visit"
  | "offer"
  | "committed"
  | "closed";

export type RecruitingTarget = {
  id: string;
  schoolName: string;
  athleticProgram?: string;
  division?: string;
  coachName?: string;
  coachEmail?: string;
  stage: RecruitingStage;
  nextAction?: string;
  nextActionDueAt?: string;
  notes?: string;
};

const stageWeight: Record<RecruitingStage, number> = {
  researching: 1,
  watchlist: 2,
  contacted: 3,
  conversation: 4,
  visit: 5,
  offer: 6,
  committed: 7,
  closed: 0,
};

export function rankRecruitingTargets(
  targets: RecruitingTarget[]
) {
  return [...targets].sort(
    (a, b) => stageWeight[b.stage] - stageWeight[a.stage]
  );
}

export function getRecruitingPipelineSummary(
  targets: RecruitingTarget[]
) {
  return {
    total: targets.length,
    conversations: targets.filter(
      (target) => target.stage === "conversation"
    ).length,
    visits: targets.filter((target) => target.stage === "visit").length,
    offers: targets.filter((target) => target.stage === "offer").length,
    committed: targets.filter(
      (target) => target.stage === "committed"
    ).length,
  };
}
