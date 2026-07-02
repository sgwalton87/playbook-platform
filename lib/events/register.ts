import {
  registerAchievementHandlers,
  registerTrustHandlers,
  registerPortfolioHandlers,
  registerTimelineHandlers,
  registerOpportunityHandlers,
  registerCompassHandlers,
} from "./handlers";

let registered = false;

export function registerPlaybookEventHandlers() {
  if (registered) return;

  registerAchievementHandlers();
  registerTrustHandlers();
  registerPortfolioHandlers();
  registerTimelineHandlers();
  registerOpportunityHandlers();
  registerCompassHandlers();

  registered = true;
}
