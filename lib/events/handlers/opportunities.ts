import { onEvent } from "../bus";

export function registerOpportunityHandlers() {
  onEvent("AchievementCreated", async (event) => {
    console.info("[Opportunity Engine] Re-run opportunity matching", event.payload);
  });

  onEvent("TrustScoreChanged", async (event) => {
    console.info("[Opportunity Engine] Re-rank opportunities after trust change", event.payload);
  });
}
