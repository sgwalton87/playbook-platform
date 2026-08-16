import { NextRequest, NextResponse } from "next/server";
import type { InvitationStatus } from "@/lib/invitations";
import { requireUser } from "@/lib/supabase/server";

function statusForClaimError(message: string) {
  if (message.includes("Authentication required")) return 401;
  if (message.includes("different email address")) return 403;
  if (message.includes("governed verification contract")) return 403;
  if (message.includes("Invitation not found")) return 404;
  if (message.includes("already")) return 409;
  return 400;
}

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
