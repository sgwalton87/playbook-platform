import { onEvent } from "../bus";
import { handleAchievementCreatedForPortfolio } from "@/lib/engines/portfolio/portfolioEngine";

export function registerPortfolioHandlers() {
  onEvent("AchievementCreated", async (event) => {
    await handleAchievementCreatedForPortfolio(event.payload);
  });
}
