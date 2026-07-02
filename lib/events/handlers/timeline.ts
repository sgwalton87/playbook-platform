import { onEvent } from "../bus";

export function registerTimelineHandlers() {
  onEvent("AchievementCreated", async (event) => {
    console.info("[Timeline Engine] Add achievement to timeline", event.payload);
  });

  onEvent("TimelineUpdated", async (event) => {
    console.info("[Timeline Engine] Timeline updated", event.payload);
  });
}
