import { onEvent } from "../bus";

export function registerPortfolioHandlers() {
  onEvent("AchievementCreated", async (event) => {
    console.info("[Portfolio Engine] Update portfolio after achievement", event.payload);
  });

  onEvent("CertificateEarned", async (event) => {
    console.info("[Portfolio Engine] Update portfolio after certificate", event.payload);
  });
}
