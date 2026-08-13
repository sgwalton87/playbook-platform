import { NextRequest, NextResponse } from "next/server";
import { applyInvitationStatus } from "@/lib/invitations/server";
import {
  buildAcceptedInvitationRelationship,
  invitationEmailMatchesUser,
} from "@/lib/support-relationships";
import { requireUser } from "@/lib/supabase/server";
import { parseInvitationAcceptPayload } from "@/lib/api/contracts/invitations";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const payload = await req.json();
    const parsed = parseInvitationAcceptPayload(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const token = parsed.value.token;
    const status = parsed.value.status;

    const { data: invitation, error: readError } = await supabase
      .from("support_invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (readError || !invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is already ${invitation.status}.` },
        { status: 409 }
      );
    }

    const update = applyInvitationStatus(status);

    const { error: updateError } = await supabase
      .from("support_invitations")
      .update(update)
      .eq("token", token);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (status === "accepted") {
      if (!invitationEmailMatchesUser(invitation.invitee_email, user.email)) {
        return NextResponse.json(
          { error: "This invitation belongs to a different email address." },
          { status: 403 }
        );
      }
    } else if (!invitationEmailMatchesUser(invitation.invitee_email, user.email)) {
      return NextResponse.json(
        { error: "This invitation belongs to a different email address." },
        { status: 403 }
      );
    }

    if (status === "accepted") {
      const relationship = buildAcceptedInvitationRelationship({
        invitation,
        supporterId: user.id,
      });

      const { error: relationshipError } = await supabase
        .from("support_relationships")
        .insert(relationship);

      if (relationshipError) {
        return NextResponse.json({ error: relationshipError.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      ok: true,
      destination: invitation.destination,
      eventHint:
        status === "accepted"
          ? {
              type: "invitation.accepted",
              scholarId: invitation.scholar_id,
              payload: {
                title: "Support invitation accepted",
                detail: `${invitation.invitee_name} joined the support network.`,
              },
            }
          : null,
      invitation: {
        ...invitation,
        ...update,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process invitation." },
      { status: 500 }
    );
  }
}
