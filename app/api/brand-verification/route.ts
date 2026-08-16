import { NextResponse } from "next/server";
import { buildBrandVerificationEvidence } from "@/lib/brand-verification/policy";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Brand Partner profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "brand-partner") return NextResponse.json({ error: "Brand verification is restricted to Brand Partner accounts." }, { status: 403 });
    const request = await supabase.from("brand_partner_verification_requests").select("id,organization_name,partner_title,brand_category,partnership_goals,target_audience,monthly_budget_range,nil_acknowledgement,campaign_types,approval_contact,campaign_scope_approved,compliance_scope_approved,status,submitted_at,reviewed_at,review_notes").eq("brand_user_id", user.id).maybeSingle();
    if (request.error) throw new Error(request.error.message);
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), request: request.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Brand verification could not be loaded." }, { status: 400 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Brand Partner profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "brand-partner") return NextResponse.json({ error: "Brand verification is restricted to Brand Partner accounts." }, { status: 403 });
    if (!profile.data.onboarding_completed) return NextResponse.json({ error: "Complete Brand Partner onboarding before submitting verification." }, { status: 409 });
    const evidence = buildBrandVerificationEvidence((profile.data.onboarding_data ?? {}) as Record<string, unknown>);
    const result = await supabase.from("brand_partner_verification_requests").upsert({
      brand_user_id: user.id, organization_name: evidence.organizationName, partner_title: evidence.partnerTitle,
      brand_category: evidence.brandCategory, partnership_goals: evidence.partnershipGoals, target_audience: evidence.targetAudience,
      monthly_budget_range: evidence.monthlyBudgetRange, nil_acknowledgement: evidence.nilAcknowledgement,
      campaign_types: evidence.campaignTypes, approval_contact: evidence.approvalContact,
      campaign_scope_approved: false, compliance_scope_approved: false, status: "pending",
      reviewed_at: null, review_notes: null, updated_at: new Date().toISOString(),
    }, { onConflict: "brand_user_id" }).select("id,status,submitted_at,campaign_scope_approved,compliance_scope_approved").single();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, request: result.data, activationState: "pending_verification", message: "Brand Partner verification evidence was submitted. No campaign or NIL authority has been activated." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Brand verification could not be submitted." }, { status: 400 });
  }
}
