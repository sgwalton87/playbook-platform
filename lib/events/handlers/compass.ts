import { onEvent } from "../bus";
import { supabase } from "@/lib/supabaseClient";

export function registerCompassHandlers() {
  onEvent("AchievementCreated", async (event) => {
    const { recordId, profileId, title } = event.payload || {};
    if (!recordId) return;

    await supabase.from("opportunity_matches").insert({
      record_id: recordId,
      opportunity_type: "mentorship",
      title: "Compass guidance",
      description: `Compass AI noticed "${title}". Add evidence and request verification to increase trust.`,
      readiness_score: 10,
      reasons: ["New achievement detected"],
      next_steps: ["Attach evidence", "Write a reflection", "Request verification"],
      status: "recommended",
      created_by: profileId,
      updated_by: profileId,
    });
  });
}
