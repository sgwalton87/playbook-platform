import { onEvent } from "../bus";

export function registerCompassHandlers() {
  onEvent("AchievementCreated", async (event) => {
    console.info("[Compass AI] Generate guidance after achievement", event.payload);
  });

  onEvent("OpportunityUnlocked", async (event) => {
    console.info("[Compass AI] Explain unlocked opportunity", event.payload);
  });
}
