import { onEvent } from "../bus";
import { supabase } from "@/lib/supabaseClient";

export function registerOpportunityHandlers() {
  onEvent("AchievementCreated", async (event) => {
    const { recordId, profileId, category } = event.payload || {};
    if (!recordId) return;

    const opportunityType =
      category === "academic" ? "scholarship" :
      category === "athletic" ? "athletics" :
      category === "career" ? "career" :
      category === "leadership" ? "leadership" :
      "mentorship";

    await supabase.from("opportunity_matches").insert({
      record_id: recordId,
      opportunity_type: opportunityType,
      title: "New opportunity signal detected",
      description: "This achievement may unlock new recommendations as the Playbook Record grows.",
      readiness_score: 25,
      reasons: ["Achievement added to Playbook Record"],
      next_steps: ["Add evidence", "Request verification", "Add reflection"],
      status: "recommended",
      created_by: profileId,
      updated_by: profileId,
    });
  });
}
