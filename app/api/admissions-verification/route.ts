import { NextResponse } from "next/server";
import { buildAdmissionsVerificationEvidence } from "@/lib/admissions-verification/policy";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Admissions profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "college-admissions") return NextResponse.json({ error: "Admissions verification is restricted to College Admissions accounts." }, { status: 403 });
    const request = await supabase.from("admissions_verification_requests")
      .select("id,college_name,department,admissions_region,official_edu_email,minimum_gpa_threshold,target_majors,student_populations,student_contact_preference,engagement_opportunities,status,submitted_at,reviewed_at,review_notes")
      .eq("admissions_user_id", user.id).maybeSingle();
    if (request.error) throw new Error(request.error.message);
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), request: request.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admissions verification could not be loaded." }, { status: 400 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Admissions profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "college-admissions") return NextResponse.json({ error: "Admissions verification is restricted to College Admissions accounts." }, { status: 403 });
    if (!profile.data.onboarding_completed) return NextResponse.json({ error: "Complete Admissions onboarding before submitting verification." }, { status: 409 });
    const evidence = buildAdmissionsVerificationEvidence((profile.data.onboarding_data ?? {}) as Record<string, unknown>);
    const result = await supabase.from("admissions_verification_requests").upsert({
      admissions_user_id: user.id, college_name: evidence.collegeName, department: evidence.department,
      admissions_region: evidence.admissionsRegion, official_edu_email: evidence.officialEduEmail,
      minimum_gpa_threshold: evidence.minimumGpaThreshold, target_majors: evidence.targetMajors,
      student_populations: evidence.studentPopulations, student_contact_preference: evidence.studentContactPreference,
      engagement_opportunities: evidence.engagementOpportunities, status: "pending", reviewed_at: null,
      review_notes: null, updated_at: new Date().toISOString(),
    }, { onConflict: "admissions_user_id" }).select("id,status,submitted_at").single();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, request: result.data, activationState: "pending_verification", message: "Admissions verification evidence was submitted. No Scholar search or application authority has been activated." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admissions verification could not be submitted." }, { status: 400 });
  }
}
