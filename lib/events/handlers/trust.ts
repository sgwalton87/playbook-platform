import { onEvent } from "../bus";

export function registerTrustHandlers() {
  onEvent("AchievementCreated", async (event) => {
    console.info("[Trust Engine] Recalculate trust after achievement", event.payload);
  });

  onEvent("VerificationApproved", async (event) => {
    console.info("[Trust Engine] Verification approved", event.payload);
  });
}
