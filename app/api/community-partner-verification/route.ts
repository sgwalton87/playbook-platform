import { NextResponse } from "next/server";
import { sendPlaybookEmail } from "@/lib/email/emailService";
import { playbookEmails } from "@/lib/email/emailConfig";
import { buildCommunityPartnerEvidence } from "@/lib/community-partner-verification/policy";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Community Partner profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "other") {
      return NextResponse.json({ error: "Community Partner verification is restricted to Community Partner accounts." }, { status: 403 });
    }
    const request = await supabase.from("community_partner_verification_requests")
      .select("id,organization_name,organization_type,official_email,organization_website,community_services,service_area,status,service_scope_status,submitted_at,reviewed_at,review_notes")
      .eq("partner_user_id", user.id).maybeSingle();
    if (request.error) throw new Error(request.error.message);
    return NextResponse.json({ ok: true, onboardingCompleted: Boolean(profile.data.onboarding_completed), request: request.data ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Community Partner verification could not be loaded." }, { status: 400 });
  }
}

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await supabase.from("profiles").select("role,profile_mode,onboarding_completed,onboarding_data").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "Community Partner profile not found." }, { status: 404 });
    if (requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "other") {
      return NextResponse.json({ error: "Community Partner verification is restricted to Community Partner accounts." }, { status: 403 });
    }
    if (!profile.data.onboarding_completed) {
      return NextResponse.json({ error: "Complete Community Partner onboarding before submitting verification." }, { status: 409 });
    }
    const docs = await supabase.rpc("get_own_community_verification_documents");
    if (docs.error) return NextResponse.json({ error: "Unable to check your saved verification documents. Please try again." }, { status: 503 });
    const hasEvidence = ((docs.data ?? []) as {name:string}[]).some(d => /^[-a-f0-9]{36}\/organization-[-a-f0-9]{36}\.(pdf|png|jpg|webp)$/.test(d.name));
    if (!hasEvidence) return NextResponse.json({ error: "Upload supporting organization documentation before submitting Community Partner verification." }, { status: 422 });
    const evidence = buildCommunityPartnerEvidence((profile.data.onboarding_data ?? {}) as Record<string, unknown>);
    const result = await supabase.from("community_partner_verification_requests").upsert({
      partner_user_id: user.id,
      organization_name: evidence.organizationName,
      organization_type: evidence.organizationType,
      official_email: evidence.officialEmail,
      organization_website: evidence.organizationWebsite,
      community_services: evidence.communityServices,
      service_area: evidence.serviceArea,
      status: "pending",
      service_scope_status: "pending",
      reviewed_at: null,
      review_notes: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "partner_user_id" }).select("id,status,service_scope_status,submitted_at").single();
    if (result.error) throw new Error(result.error.message);
    // The durable outbox prevents duplicate messages on repeated submit.
    const claim = await supabase.rpc("claim_own_community_verification_notice", { requested_id: result.data.id });
    let notificationStatus = "queued";
    if (!claim.error && claim.data && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const receipt = await sendPlaybookEmail({
          to: playbookEmails.onboarding,
          subject: "Playbook Community Partner verification submitted",
          text: "A Community Partner verification request is pending human review. Open the governed Admin Review Center at https://app.playbookseriesinc.org/admin to examine the request and private evidence. Do not forward sensitive evidence by email.",
          fromType: "onboarding",
          replyToType: "onboarding",
          messageId: `<community-verification-${result.data.id}@playbookseriesinc.org>`,
        });
        notificationStatus = receipt.accepted?.length ? "sent" : "failed";
        await supabase.rpc("finish_own_community_verification_notice", {
          requested_id: result.data.id, requested_claim: claim.data, requested_status: notificationStatus,
          requested_error: notificationStatus === "sent" ? null : "Email server did not accept onboarding mailbox.",
          requested_message_id: receipt.messageId || null,
        });
      } catch {
        notificationStatus = "delivery_unknown";
        await supabase.rpc("finish_own_community_verification_notice", {
          requested_id: result.data.id, requested_claim: claim.data, requested_status: "delivery_unknown",
          requested_error: "SMTP acceptance uncertain; do not retry without reviewing mail logs.",
          requested_message_id: null,
        });
      }
    } else if (claim.error) {
      notificationStatus = "queue_unavailable";
    }
    return NextResponse.json({
      ok: true,
      request: result.data,
      reviewNotification: notificationStatus,
      activationState: "pending_verification",
      message: "Community Partner evidence was submitted. No Scholar access or service-delivery authority has been activated.",
    }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Community Partner verification could not be submitted." }, { status: 400 });
  }
}
