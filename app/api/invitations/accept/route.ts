import { NextRequest, NextResponse } from "next/server";
import type { InvitationStatus } from "@/lib/invitations";
import { requireUser } from "@/lib/supabase/server";
import { requirePlaybookRole } from "@/lib/roles/registry";

function statusForClaimError(message: string) {
  if (message.includes("Authentication required")) return 401;
  if (message.includes("different email address")) return 403;
  if (message.includes("governed verification contract")) return 403;
  if (message.includes("Invitation not found")) return 404;
  if (message.includes("already")) return 409;
  return 400;
}

const EXPECTED_ROLE: Record<string, string> = {
  parent_guardian: "family", mentor: "mentor", educator: "educator",
  counselor: "high-school-counselor", coach: "coach", district_admin: "district",
  college_recruiter: "college-coach", college_admissions: "college-admissions",
  community_partner: "other", employer_partner: "employer",
};

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await req.json();
    const token = body.token as string | undefined;
    const status = (body.status || "accepted") as InvitationStatus;

    if (!token) {
      return NextResponse.json({ error: "Missing invitation token." }, { status: 400 });
    }

    if (status !== "accepted" && status !== "declined") {
      return NextResponse.json({ error: "Invalid invitation status." }, { status: 400 });
    }

    if (status === "accepted") {
      const { data: invite, error: inviteError } = await supabase.from("support_invitations")
        .select("relationship").eq("token", token).maybeSingle();
      if (inviteError) return NextResponse.json({ error: "Invitation validation unavailable." }, { status: 400 });
      if (!invite) return NextResponse.json({ error: "Invitation not found for this account and email." }, { status: 404 });
      {
        const expected = EXPECTED_ROLE[invite.relationship];
        if (!expected) return NextResponse.json({ error: "This relationship requires separate verification." }, { status: 403 });
        const { data: profile, error: profileError } = await supabase.from("profiles")
          .select("role,profile_mode").eq("id", user.id).maybeSingle();
        if (profileError) return NextResponse.json({ error: "Cannot verify account type." }, { status: 400 });
        let actual: string;
        try { actual = requirePlaybookRole(profile?.profile_mode ?? profile?.role); }
        catch { return NextResponse.json({ error: "Complete the correct Playbook account type before accepting." }, { status: 409 }); }
        if (actual !== expected) {
          return NextResponse.json({
            error: `This invitation is for a ${expected} account, but your account is ${actual}. The Scholar must withdraw the pending invitation and invite you with your correct relationship type. Existing account roles are never changed automatically.`
          }, { status: 409 });
        }
      }
    }

    const { data, error } = await supabase.rpc("claim_support_invitation", {
      invitation_token: token,
      desired_status: status,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: statusForClaimError(error.message) }
      );
    }

    const claim = Array.isArray(data) ? data[0] : data;
    if (!claim) {
      return NextResponse.json({ error: "Invitation claim returned no result." }, { status: 500 });
    }

    const pendingMentorValidation = claim.activation_state === "pending_validation";

    return NextResponse.json({
      ok: true,
      // Every accepted role enters its own Operating System. Mentor OS is
      // responsible for rendering the pending-validation gate without exposing
      // Scholar data before the threshold is satisfied.
      destination: claim.destination,
      activationState: claim.activation_state,
      validationRequestId: claim.validation_request_id ?? null,
      eventHint:
        status === "accepted"
          ? {
              type: pendingMentorValidation ? "mentor.validation_requested" : "invitation.accepted",
              scholarId: claim.scholar_id,
              payload: {
                title: pendingMentorValidation ? "Mentor validation requested" : "Support invitation accepted",
                detail: pendingMentorValidation
                  ? `${claim.invitee_name} accepted the mentor invitation and is awaiting support-system validation.`
                  : `${claim.invitee_name} joined the support network.`,
              },
            }
          : null,
      invitation: {
        token,
        scholar_id: claim.scholar_id,
        invitee_name: claim.invitee_name,
        relationship: claim.relationship,
        status: claim.status,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process invitation." },
      { status: 500 }
    );
  }
}
