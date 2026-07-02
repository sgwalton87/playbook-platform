import { createTimelineEvent } from "@/lib/repositories/timelineRepository";

export async function handleAchievementCreatedForPortfolio(payload: any) {
  if (!payload?.recordId) return;

  return createTimelineEvent({
    recordId: payload.recordId,
    achievementId: payload.achievementId,
    eventType: "portfolio_update",
    title: "Portfolio updated",
    description: "A new achievement was added to the learner's portfolio signals.",
    source: "portfolio_engine",
    profileId: payload.profileId,
  });
}
