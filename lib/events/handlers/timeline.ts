import { onEvent } from "../bus";
import { supabase } from "@/lib/supabaseClient";

export function registerTimelineHandlers() {
  onEvent("AchievementCreated", async (event) => {
    const { recordId, achievementId, title, category } = event.payload || {};
    if (!recordId || !achievementId || !title) return;

    await supabase.from("timeline_events").insert({
      record_id: recordId,
      achievement_id: achievementId,
      event_type: category || "achievement",
      title,
      description: "Achievement added to the Playbook Record.",
      event_date: new Date().toISOString(),
      source: "event_bus",
      verified: false,
      created_by: event.payload.profileId,
      updated_by: event.payload.profileId,
    });
  });
}
