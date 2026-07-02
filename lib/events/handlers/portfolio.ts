import { onEvent } from "../bus";
import { supabase } from "@/lib/supabaseClient";

export function registerPortfolioHandlers() {
  onEvent("AchievementCreated", async (event) => {
    const { recordId, profileId, achievementId } = event.payload || {};
    if (!recordId) return;

    await supabase.from("timeline_events").insert({
      record_id: recordId,
      achievement_id: achievementId,
      event_type: "portfolio_update",
      title: "Portfolio updated",
      description: "A new achievement was added to the learner's portfolio signals.",
      event_date: new Date().toISOString(),
      source: "portfolio_engine",
      verified: false,
      created_by: profileId,
      updated_by: profileId,
    });
  });
}
