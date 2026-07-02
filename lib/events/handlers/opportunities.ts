import { onEvent } from "../bus";
import { handleAchievementCreatedForOpportunities } from "@/lib/engines/opportunities/opportunityEngine";

export function registerOpportunityHandlers() {
  onEvent("AchievementCreated", async (event) => {
    await handleAchievementCreatedForOpportunities(event.payload);
  });
}
