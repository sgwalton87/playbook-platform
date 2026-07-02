import { onEvent } from "../bus";
import { handleAchievementCreatedForCompass } from "@/lib/engines/compass/compassEngine";

export function registerCompassHandlers() {
  onEvent("AchievementCreated", async (event) => {
    await handleAchievementCreatedForCompass(event.payload);
  });
}
