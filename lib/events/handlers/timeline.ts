import { onEvent } from "../bus";
import { handleAchievementCreatedForTimeline } from "@/lib/engines/timeline/timelineEngine";

export function registerTimelineHandlers() {
  onEvent("AchievementCreated", async (event) => {
    await handleAchievementCreatedForTimeline(event.payload);
  });
}
