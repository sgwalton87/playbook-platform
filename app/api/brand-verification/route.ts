import { COMMUNITY_POLICY_VERSION } from "@/lib/trust/communityStandards";
import { parseRegistration } from "@/lib/verification/registration";
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
    const [details, workflow] = await Promise.all([
      supabase.from("brand_partner_registration_details").select("formation_state,entity_type,entity_number,safety_answers,safeguarding_accepted").eq("brand_user_id", user.id).maybeSingle(),
      request.data ? supabase.from("brand_partner_review_context").select("outcome,reason_code,public_message,updated_at").eq("request_id", request.data.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (details.error || workflow.error) throw new Error("Verification details are temporarily unavailable.");
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), request: request.data ?? null, registrationDetails: details.data, workflow: workflow.data }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Brand verification could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Brand Partner profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "brand-partner") return NextResponse.json({ error: "Brand verification is restricted to Brand Partner accounts." }, { status: 403 });
    if (!profile.data.onboarding_completed) return NextResponse.json({ error: "Complete Brand Partner onboarding before submitting verification." }, { status: 409 });
    const previous = await supabase.from("brand_partner_verification_requests")
      .select("status,organization_name,nil_acknowledgement,campaign_scope_approved,compliance_scope_approved")
      .eq("brand_user_id", user.id).maybeSingle();
    if (previous.error) throw new Error(previous.error.message);
    if (previous.data?.status === "approved") {
      return NextResponse.json({ error: "Approved verification cannot be replaced by self-service resubmission." }, { status: 409 });
    }
    const consent = await supabase.from("verification_community_consents").select("accepted_at").eq("user_id",user.id).eq("policy_version",COMMUNITY_POLICY_VERSION).maybeSingle();
    if (consent.error) return NextResponse.json({error:"Community agreement status unavailable."},{status:503});
    if (!consent.data) return NextResponse.json({error:"Review and acknowledge the community standards before submitting documents."},{status:422});
    const uploaded = await supabase.rpc("get_own_brand_verification_documents");
    if (uploaded.error) return NextResponse.json({ error: "Business documentation could not be verified. Try again." }, { status: 503 });
    const hasEvidence = (uploaded.data ?? []).some((item: { name: string; archived: boolean }) => !item.archived && /^(letterhead|business-card)-[a-f0-9-]+\.(pdf|png|jpg|webp)$/.test(item.name));
    if (!hasEvidence) return NextResponse.json({ error: "Upload company letterhead or a business card before submitting verification." }, { status: 422 });
    const onboarding = (profile.data.onboarding_data ?? {}) as Record<string, unknown>;
    const privateDraft = onboarding.brand_organization_draft && typeof onboarding.brand_organization_draft === "object"
      ? onboarding.brand_organization_draft as Record<string, unknown> : {};
    const contactName = typeof privateDraft.contactName === "string" ? privateDraft.contactName.trim() : "";
    const contactEmail = typeof privateDraft.contactEmail === "string" ? privateDraft.contactEmail.trim() : "";
    const contactPhone = typeof privateDraft.contactPhone === "string" ? privateDraft.contactPhone.trim() : "";
    if (!contactName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) || !/^[+0-9() .-]{7,40}$/.test(contactPhone)) {
      return NextResponse.json({ error: "Save the main business contact name, email and telephone number before submitting verification." }, { status: 422 });
    }
    const input = await request.json().catch(() => ({})) as { organizationName?: unknown; nilAcknowledged?: unknown; registration?: unknown };
    const organizationName = typeof input.organizationName === "string" ? input.organizationName.trim().slice(0, 240) : "";
    if (!organizationName) return NextResponse.json({ error: "Enter the legal organization name before submitting verification." }, { status: 422 });
    if (input.nilAcknowledged !== true) return NextResponse.json({ error: "Explicit NIL and compliance acknowledgement is required." }, { status: 422 });
    let registration;
    try { registration = parseRegistration(input.registration); }
    catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Business and safeguarding declarations required." }, { status: 422 }); }
    const savedDetails = await supabase.from("brand_partner_registration_details").upsert({ brand_user_id: user.id, formation_state: registration.formationState, entity_type: registration.entityType, entity_number: registration.entityNumber, safety_answers: registration.safetyAnswers, safeguarding_accepted: registration.safeguardingAccepted, updated_at: new Date().toISOString() }, { onConflict: "brand_user_id" });
    if (savedDetails.error) throw new Error("Business and safeguarding declarations could not be saved.");
    const evidence = buildBrandVerificationEvidence({
      ...onboarding,
      organization_name: organizationName,
      nil_acknowledgement: "Acknowledged by authenticated business representative on verification submission",
    });
    const result = await supabase.from("brand_partner_verification_requests").upsert({
      brand_user_id: user.id, organization_name: evidence.organizationName, partner_title: evidence.partnerTitle,
      brand_category: evidence.brandCategory, partnership_goals: evidence.partnershipGoals, target_audience: evidence.targetAudience,
      monthly_budget_range: evidence.monthlyBudgetRange, nil_acknowledgement: evidence.nilAcknowledgement,
      campaign_types: evidence.campaignTypes, approval_contact: evidence.approvalContact,
      campaign_scope_approved: false, compliance_scope_approved: false, status: "pending", submitted_at: new Date().toISOString(),
      reviewed_at: null, review_notes: null, updated_at: new Date().toISOString(),
    }, { onConflict: "brand_user_id" }).select("id,status,submitted_at,campaign_scope_approved,compliance_scope_approved").single();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, request: result.data, activationState: "pending_verification", message: "Brand Partner verification evidence was submitted. No campaign or NIL authority has been activated." }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Brand verification could not be submitted." }, { status: 400 });
  }
}
