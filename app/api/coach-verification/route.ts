import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requirePlaybookRole } from "@/lib/roles/registry";

type CoachEvidence = {
  school?: unknown;
  school_city?: unknown;
  school_state?: unknown;
  official_school_email?: unknown;
  primary_sport?: unknown;
  coach_role?: unknown;
  years_coaching?: unknown;
  roster_size?: unknown;
  upload_game_film?: unknown;
  send_player_recommendations?: unknown;
  coach_support_focus?: unknown;
};

const text = (value: unknown) => String(value ?? "").trim();

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const profile = await supabase
      .from("profiles")
      .select("role,profile_mode,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Coach profile not found." }, { status: 404 });

    const role = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
    if (role !== "coach") {
      return NextResponse.json({ error: "Coach verification is restricted to Coach accounts." }, { status: 403 });
    }

    const request = await supabase
      .from("coach_verification_requests")
      .select("id,school,school_city,school_state,official_school_email,primary_sport,coach_role,years_coaching,roster_size,status,submitted_at,reviewed_at,review_notes")
      .eq("coach_user_id", user.id)
      .maybeSingle();
    if (request.error) throw new Error(request.error.message);

    return NextResponse.json({
      ok: true,
      onboardingCompleted: Boolean(profile.data.onboarding_completed),
      request: request.data ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Coach verification could not be loaded." },
      { status: 400 }
    );
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const profile = await supabase
      .from("profiles")
      .select("role,profile_mode,onboarding_completed,onboarding_data")
      .eq("id", user.id)
      .maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Coach profile not found." }, { status: 404 });

    const role = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
    if (role !== "coach") {
      return NextResponse.json({ error: "Coach verification is restricted to Coach accounts." }, { status: 403 });
    }
    if (!profile.data.onboarding_completed) {
      return NextResponse.json({ error: "Complete Coach onboarding before submitting verification." }, { status: 409 });
    }

    const evidence = (profile.data.onboarding_data ?? {}) as CoachEvidence;
    const school = text(evidence.school);
    const officialSchoolEmail = text(evidence.official_school_email);
    const primarySport = text(evidence.primary_sport);
    const coachRole = text(evidence.coach_role);

    if (!school || !officialSchoolEmail || !primarySport || !coachRole) {
      return NextResponse.json(
        { error: "Coach verification requires school, official school email, primary sport, and coaching role." },
        { status: 400 }
      );
    }

    const supportFocus = Array.isArray(evidence.coach_support_focus)
      ? evidence.coach_support_focus.map(text).filter(Boolean)
      : [];

    const result = await supabase
      .from("coach_verification_requests")
      .upsert({
        coach_user_id: user.id,
        school,
        school_city: text(evidence.school_city) || null,
        school_state: text(evidence.school_state) || null,
        official_school_email: officialSchoolEmail,
        primary_sport: primarySport,
        coach_role: coachRole,
        years_coaching: text(evidence.years_coaching) || null,
        roster_size: text(evidence.roster_size) || null,
        upload_game_film: text(evidence.upload_game_film) || null,
        send_player_recommendations: text(evidence.send_player_recommendations) || null,
        support_focus: supportFocus,
        status: "pending",
        reviewed_at: null,
        review_notes: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "coach_user_id" })
      .select("id,status,submitted_at")
      .single();
    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({
      ok: true,
      request: result.data,
      activationState: "pending_verification",
      message: "Coach verification evidence was submitted. No Scholar access or Coach authority has been activated.",
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Coach verification could not be submitted." },
      { status: 400 }
    );
  }
}
