import { createTimelineEvent } from "@/lib/repositories/timelineRepository";

export async function handleAchievementCreatedForTimeline(payload: LegacyValue) {
  if (!payload?.recordId || !payload?.achievementId || !payload?.title) return;

  return createTimelineEvent({
    recordId: payload.recordId,
    achievementId: payload.achievementId,
    eventType: payload.category || "achievement",
    title: payload.title,
    description: "Achievement added to the Playbook Record.",
    source: "timeline_engine",
    profileId: payload.profileId,
  });
}
