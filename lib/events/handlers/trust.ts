import { onEvent } from "../bus";
import { supabase } from "@/lib/supabaseClient";

export function registerTrustHandlers() {
  onEvent("AchievementCreated", async (event) => {
    const { recordId, profileId } = event.payload || {};
    if (!recordId) return;

    const { data: achievements } = await supabase
      .from("achievements")
      .select("id")
      .eq("record_id", recordId)
      .is("deleted_at", null);

    const count = achievements?.length || 0;
    const score = Math.min(100, count * 10);

    const level =
      score >= 90 ? "impact" :
      score >= 75 ? "outcome" :
      score >= 60 ? "verification" :
      score >= 40 ? "evidence" :
      score >= 20 ? "achievement" :
      "activity";

    await supabase.from("trust_reports").insert({
      record_id: recordId,
      trust_score: score,
      trust_level: level,
      signals: [{ id: "achievement_count", label: "Achievements added", points: score }],
      missing: score < 60 ? ["Add evidence and request verification to strengthen trust."] : [],
      created_by: profileId,
    });
  });
}
