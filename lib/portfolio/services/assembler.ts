import { supabase } from "@/lib/supabaseClient";
import { mapProfileToPortfolio } from "./profile";
import { buildPortfolioIntelligence } from "./intelligence";
import { buildScholarRecord } from "../scholar-record";

export function assembleScholarRecord(profileData: any, data: { certificates?: unknown[]; badges?: unknown[]; posts?: unknown[]; activities?: unknown[] } = {}) {
  const portfolio = mapProfileToPortfolio(profileData);

  const intelligence = buildPortfolioIntelligence({
    rawProfile: profileData,
    portfolio,
    certificates: data.certificates || [],
    badges: data.badges || [],
    posts: data.posts || [],
    activities: data.activities || [],
  });

  const assembled = {
    rawProfile: profileData,
    portfolio,
    intelligence,
    certificates: data.certificates || [],
    badgeRows: data.badges || [],
    posts: data.posts || [],
    activities: data.activities || [],
  };

  return {
    ...assembled,
    scholarRecord: buildScholarRecord(assembled),
  };
}

export async function getPortfolioByUsername(username: string) {
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error || !profileData) {
    return null;
  }

  const [{ data: certData }, { data: badgeData }, { data: feedData }, { data: activityData }] =
    await Promise.all([
      supabase.from("certificates").select("*").eq("user_id", profileData.id).order("issued_at", { ascending: false }),
      supabase.from("user_badges").select("id,awarded_at,badges(id,name,description,image_url)").eq("user_id", profileData.id).order("awarded_at", { ascending: false }),
      supabase.from("feed_posts").select("*").eq("user_id", profileData.id).or("visibility.eq.public,visibility.is.null").order("created_at", { ascending: false }).limit(50),
      supabase.from("student_activities").select("*").eq("student_id", profileData.id).order("created_at", { ascending: false }),
    ]);

  return assembleScholarRecord(profileData, {
    certificates: certData || [],
    badges: badgeData || [],
    posts: feedData || [],
    activities: activityData || [],
  });
}
