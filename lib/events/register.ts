import {
  registerAchievementHandlers,
  registerTrustHandlers,
  registerPortfolioHandlers,
  registerTimelineHandlers,
  registerOpportunityHandlers,
  registerCompassHandlers,
  registerAcademicHandlers,
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
  registerAcademicHandlers();

  registered = true;
}
