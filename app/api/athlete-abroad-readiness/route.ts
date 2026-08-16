import { NextResponse } from "next/server";
import { buildAthleteAbroadEvidence } from "@/lib/athlete-abroad-verification/policy";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Athlete Abroad profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "athlete-abroad") {
      return NextResponse.json({ error: "Global readiness is restricted to Athlete Abroad accounts." }, { status: 403 });
    }
    const review = await supabase.from("athlete_abroad_readiness_reviews")
      .select("id,destination_regions,passport_readiness,eligibility_context,support_needs,review_status,jurisdiction_scope_status,submitted_at,reviewed_at,review_notes")
      .eq("athlete_user_id", user.id).maybeSingle();
    if (review.error) throw new Error(review.error.message);
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), review: review.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Global readiness could not be loaded." }, { status: 400 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Athlete Abroad profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "athlete-abroad") {
      return NextResponse.json({ error: "Global readiness is restricted to Athlete Abroad accounts." }, { status: 403 });
    }
    if (!profile.data.onboarding_completed) {
      return NextResponse.json({ error: "Complete Athlete Abroad onboarding before submitting global readiness." }, { status: 409 });
    }
    const evidence = buildAthleteAbroadEvidence((profile.data.onboarding_data ?? {}) as Record<string, unknown>);
    const result = await supabase.from("athlete_abroad_readiness_reviews").upsert({
      athlete_user_id: user.id,
      destination_regions: evidence.destinationRegions,
      passport_readiness: evidence.passportReadiness,
      eligibility_context: evidence.eligibilityContext,
      support_needs: evidence.supportNeeds,
      review_status: "pending",
      jurisdiction_scope_status: "pending",
      reviewed_at: null,
      review_notes: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "athlete_user_id" }).select("id,review_status,jurisdiction_scope_status,submitted_at").single();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({
      ok: true,
      review: result.data,
      activationState: "pending_global_readiness",
      message: "Global readiness evidence was submitted. Your self-owned record remains yours; jurisdiction-sensitive global capabilities remain restricted pending review.",
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Global readiness could not be submitted." }, { status: 400 });
  }
}
