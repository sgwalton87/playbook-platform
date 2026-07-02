import { supabase } from "@/lib/supabaseClient";

export async function ensurePlaybookRecord(profileId: string) {
  const existing = await supabase
    .from("playbook_records")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing.data) return existing.data;

  const created = await supabase
    .from("playbook_records")
    .insert({
      profile_id: profileId,
      created_by: profileId,
      updated_by: profileId,
    })
    .select("*")
    .single();

  if (created.error) throw created.error;
  return created.data;
}

export async function createAchievementWithEvidence({
  profileId,
  title,
  category,
  description,
  evidenceTitle,
  evidenceUrl,
  reflection,
}: {
  profileId: string;
  title: string;
  category: string;
  description?: string;
  evidenceTitle?: string;
  evidenceUrl?: string;
  reflection?: string;
}) {
  const record = await ensurePlaybookRecord(profileId);

  const achievementRes = await supabase
    .from("achievements")
    .insert({
      record_id: record.id,
      title,
      category,
      description,
      created_by: profileId,
      updated_by: profileId,
    })
    .select("*")
    .single();

  if (achievementRes.error) throw achievementRes.error;

  const achievement = achievementRes.data;

  await supabase.from("evidence_packs").insert({
    achievement_id: achievement.id,
    title: `${title} Evidence Pack`,
    summary: description || null,
    created_by: profileId,
    updated_by: profileId,
  });

  if (evidenceTitle || evidenceUrl) {
    await supabase.from("evidence").insert({
      achievement_id: achievement.id,
      title: evidenceTitle || title,
      evidence_type: evidenceUrl ? "link" : "other",
      url: evidenceUrl || null,
      created_by: profileId,
      updated_by: profileId,
    });
  }

  if (reflection) {
    await supabase.from("reflections").insert({
      achievement_id: achievement.id,
      response: reflection,
      created_by: profileId,
      updated_by: profileId,
    });
  }

  await supabase.from("timeline_events").insert({
    record_id: record.id,
    achievement_id: achievement.id,
    event_type: "achievement",
    title,
    description,
    event_date: new Date().toISOString(),
    source: "achievement_workflow",
    verified: false,
    created_by: profileId,
    updated_by: profileId,
  });

  return achievement;
}
