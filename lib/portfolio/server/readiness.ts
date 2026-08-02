import "server-only";

import { calculatePortfolioCompletion } from "@/lib/portfolio/services/completion";

export async function loadScholarPortfolioReadiness(supabase: LegacyValue, scholarId: string) {
  const [{ data: profile, error: profileError }, { count: evidenceCount }, { count: verifiedEvidenceCount }] = await Promise.all([
    supabase.from("profiles").select("full_name,avatar_url,bio,school,grade,gpa,dream_school,ideal_profession").eq("id", scholarId).maybeSingle(),
    supabase.from("evidence").select("id", { count: "exact", head: true }).eq("owner_id", scholarId).is("deleted_at", null),
    supabase.from("evidence").select("id", { count: "exact", head: true }).eq("owner_id", scholarId).eq("verification_state", "verified").is("deleted_at", null),
  ]);
  if (profileError || !profile) return { ok: false as const, error: "Scholar Record profile unavailable." };
  const portfolio = {
    identity: { fullName: profile.full_name, avatarUrl: profile.avatar_url, bio: profile.bio, school: profile.school, grade: profile.grade },
    academics: { weightedGpa: profile.gpa, dreamSchool: profile.dream_school },
    career: { idealProfession: profile.ideal_profession },
    evidenceCount: evidenceCount || 0,
    verifiedEvidenceCount: verifiedEvidenceCount || 0,
  };
  return { ok: true as const, portfolio, completion: calculatePortfolioCompletion(portfolio) };
}
