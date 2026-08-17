import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import {
  evaluateNILPreparation,
  summarizeNILPreparation,
  type NILPreparationFacts,
  type NILPreparationReview,
  type NILPreparationDimension,
  type NILPreparationReviewStatus,
} from "@/lib/scholar-athlete/nilPreparationEngine";

const dimensions: NILPreparationDimension[] = [
  "personal_brand",
  "financial_literacy",
  "contract_awareness",
  "compliance_awareness",
  "media_kit",
  "social_professionalism",
  "opportunity_tracking",
];

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const [profileResult, athleteResult, mediaResult, coursesResult, modulesResult, progressResult, credentialsResult, dealsResult, reviewsResult] = await Promise.all([
      supabase.from("profiles").select("avatar_url,cover_url,bio,instagram,tiktok,twitter,nil_instagram,nil_tiktok,nil_twitter,nil_brand_interests").eq("id", user.id).maybeSingle(),
      supabase.from("athlete_profiles").select("highlight_url").eq("scholar_id", user.id).maybeSingle(),
      supabase.from("album_media").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("learning_courses").select("slug,status").in("slug", ["money-in-the-game", "nil-readiness-for-athletes"]),
      supabase.from("learning_modules").select("course_slug,module_key,required").eq("course_slug", "money-in-the-game"),
      supabase.from("learning_module_progress").select("module_key").eq("user_id", user.id).eq("course_slug", "money-in-the-game"),
      supabase.from("learning_credentials").select("id").eq("user_id", user.id).eq("course_slug", "money-in-the-game").limit(1),
      supabase.from("nil_deals").select("contract_status,disclosure_status").eq("scholar_id", user.id),
      supabase.from("nil_preparation_reviews").select("dimension,review_status,reflection,reviewed_at").eq("scholar_id", user.id),
    ]);

    const error = profileResult.error || athleteResult.error || mediaResult.error || coursesResult.error || modulesResult.error || progressResult.error || credentialsResult.error || dealsResult.error || reviewsResult.error;
    if (error) throw new Error(error.message);

    const profile = profileResult.data;
    const socialLinks = [profile?.instagram, profile?.tiktok, profile?.twitter, profile?.nil_instagram, profile?.nil_tiktok, profile?.nil_twitter]
      .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index);
    const requiredModules = (modulesResult.data || []).filter((module) => module.required);
    const requiredKeys = new Set(requiredModules.map((module) => module.module_key));
    const completedRequired = new Set((progressResult.data || []).map((item) => item.module_key).filter((key) => requiredKeys.has(key)));
    const nilCourse = (coursesResult.data || []).find((course) => course.slug === "nil-readiness-for-athletes");
    const deals = dealsResult.data || [];

    const facts: NILPreparationFacts = {
      profile: {
        hasAvatar: Boolean(profile?.avatar_url),
        hasCover: Boolean(profile?.cover_url),
        hasBio: Boolean(profile?.bio?.trim()),
        linkedSocialCount: socialLinks.length,
        brandInterestCount: Array.isArray(profile?.nil_brand_interests) ? profile.nil_brand_interests.length : 0,
      },
      athlete: {
        hasHighlightFilm: Boolean(athleteResult.data?.highlight_url),
      },
      media: {
        albumMediaCount: mediaResult.count || 0,
      },
      learning: {
        moneyInTheGameRequiredModules: requiredModules.length,
        moneyInTheGameCompletedModules: completedRequired.size,
        moneyInTheGameCredential: (credentialsResult.data || []).length > 0,
        nilReadinessCourseStatus: nilCourse?.status === "published"
          ? "published"
          : nilCourse?.status === "coming_soon"
            ? "coming_soon"
            : "missing",
      },
      deals: {
        total: deals.length,
        withContractRecord: deals.filter((deal) => deal.contract_status !== "not_received").length,
        disclosureStarted: deals.filter((deal) => deal.disclosure_status !== "not_started").length,
      },
    };

    const reviews: NILPreparationReview[] = (reviewsResult.data || []).map((review) => ({
      dimension: review.dimension as NILPreparationDimension,
      reviewStatus: review.review_status as NILPreparationReviewStatus,
      reflection: review.reflection,
      reviewedAt: review.reviewed_at,
    }));

    const findings = evaluateNILPreparation(facts, reviews);
    return NextResponse.json({ ok: true, facts, reviews, findings, summary: summarizeNILPreparation(findings), dimensions });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "NIL preparation context could not be loaded." }, { status: 400 });
  }
}
