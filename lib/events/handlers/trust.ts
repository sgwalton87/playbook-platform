import { onEvent } from "../bus";
import { handleAchievementCreatedForTrust } from "@/lib/engines/trust/trustEngine";

export function registerTrustHandlers() {
  onEvent("AchievementCreated", async (event) => {
    await handleAchievementCreatedForTrust(event.payload);
  });
}
