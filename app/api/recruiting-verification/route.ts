import { NextResponse } from "next/server";
import { buildRecruitingVerificationEvidence } from "@/lib/recruiting-verification/policy";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Recruiter profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "college-coach") {
      return NextResponse.json({ error: "Recruiting verification is restricted to College Coach / Recruiter accounts." }, { status: 403 });
    }
    const request = await supabase.from("recruiting_verification_requests")
      .select("id,college_name,conference,division_level,official_edu_email,primary_sport_recruiting,positions_recruiting,recruiting_radius,graduation_classes_recruiting,preferred_recruiting_contact,authorization_status,status,submitted_at,reviewed_at,review_notes")
      .eq("recruiter_user_id", user.id).maybeSingle();
    if (request.error) throw new Error(request.error.message);
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), request: request.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recruiting verification could not be loaded." }, { status: 400 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Recruiter profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "college-coach") {
      return NextResponse.json({ error: "Recruiting verification is restricted to College Coach / Recruiter accounts." }, { status: 403 });
    }
    if (!profile.data.onboarding_completed) return NextResponse.json({ error: "Complete Recruiting onboarding before submitting verification." }, { status: 409 });

    const evidence = buildRecruitingVerificationEvidence((profile.data.onboarding_data ?? {}) as Record<string, unknown>);
    const result = await supabase.from("recruiting_verification_requests").upsert({
      recruiter_user_id: user.id,
      college_name: evidence.collegeName,
      conference: evidence.conference,
      division_level: evidence.divisionLevel,
      official_edu_email: evidence.officialEduEmail,
      primary_sport_recruiting: evidence.primarySportRecruiting,
      positions_recruiting: evidence.positionsRecruiting,
      recruiting_radius: evidence.recruitingRadius,
      graduation_classes_recruiting: evidence.graduationClassesRecruiting,
      preferred_recruiting_contact: evidence.preferredRecruitingContact,
      authorization_status: evidence.authorizationStatus,
      status: "pending", reviewed_at: null, review_notes: null, updated_at: new Date().toISOString(),
    }, { onConflict: "recruiter_user_id" }).select("id,status,submitted_at").single();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, request: result.data, activationState: "pending_verification", message: "Recruiting verification evidence was submitted. No athlete discovery or recruiting authority has been activated." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recruiting verification could not be submitted." }, { status: 400 });
  }
}
