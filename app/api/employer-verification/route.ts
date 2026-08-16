import { NextResponse } from "next/server";
import { buildEmployerVerificationEvidence } from "@/lib/employer-verification/policy";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Employer profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "employer") return NextResponse.json({ error: "Employer verification is restricted to Employer accounts." }, { status: 403 });
    const request = await supabase.from("employer_verification_requests").select("id,organization_name,official_email,organization_website,opportunity_types,candidate_audience,status,submitted_at,reviewed_at,review_notes").eq("employer_user_id", user.id).maybeSingle();
    if (request.error) throw new Error(request.error.message);
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), request: request.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Employer verification could not be loaded." }, { status: 400 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Employer profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "employer") return NextResponse.json({ error: "Employer verification is restricted to Employer accounts." }, { status: 403 });
    if (!profile.data.onboarding_completed) return NextResponse.json({ error: "Complete Employer onboarding before submitting verification." }, { status: 409 });
    const evidence = buildEmployerVerificationEvidence((profile.data.onboarding_data ?? {}) as Record<string, unknown>);
    const result = await supabase.from("employer_verification_requests").upsert({
      employer_user_id: user.id, organization_name: evidence.organizationName, official_email: evidence.officialEmail,
      organization_website: evidence.organizationWebsite, opportunity_types: evidence.opportunityTypes,
      candidate_audience: evidence.candidateAudience, status: "pending", reviewed_at: null, review_notes: null, updated_at: new Date().toISOString(),
    }, { onConflict: "employer_user_id" }).select("id,status,submitted_at").single();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, request: result.data, activationState: "pending_verification", message: "Employer verification evidence was submitted. No opportunity publishing or candidate-review authority has been activated." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Employer verification could not be submitted." }, { status: 400 });
  }
}
