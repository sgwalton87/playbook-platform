import { supabase } from "@/lib/supabaseClient";
import { createTrustReport } from "@/lib/repositories/trustRepository";

export async function handleAchievementCreatedForTrust(payload: LegacyValue) {
  if (!payload?.recordId) return;

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id")
    .eq("record_id", payload.recordId)
    .is("deleted_at", null);

  const count = achievements?.length || 0;
  const trustScore = Math.min(100, count * 10);

  const trustLevel =
    trustScore >= 90 ? "impact" :
    trustScore >= 75 ? "outcome" :
    trustScore >= 60 ? "verification" :
    trustScore >= 40 ? "evidence" :
    trustScore >= 20 ? "achievement" :
    "activity";

  return createTrustReport({
    recordId: payload.recordId,
    trustScore,
    trustLevel,
    signals: [
      {
        id: "achievement_count",
        label: "Achievements added",
        points: trustScore,
      },
    ],
    missing:
      trustScore < 60
        ? ["Add evidence and request verification to strengthen trust."]
        : [],
    profileId: payload.profileId,
  });
}
