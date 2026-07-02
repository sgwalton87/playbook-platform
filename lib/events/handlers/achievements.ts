import { onEvent } from "../bus";

export function registerAchievementHandlers() {
  onEvent("AchievementCreated", async (event) => {
    console.info("[Playbook Event] AchievementCreated", event.payload);
  });
}
