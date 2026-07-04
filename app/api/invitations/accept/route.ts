import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { applyInvitationStatus } from "@/lib/invitations/server";
import type { InvitationStatus } from "@/lib/invitations";
import {
  buildAcceptedInvitationRelationship,
  invitationEmailMatchesUser,
} from "@/lib/support-relationships";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = body.token as string | undefined;
    const status = (body.status || "accepted") as InvitationStatus;

    if (!token) {
      return NextResponse.json({ error: "Missing invitation token." }, { status: 400 });
    }

    if (status !== "accepted" && status !== "declined") {
      return NextResponse.json({ error: "Invalid invitation status." }, { status: 400 });
    }

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (status === "accepted") {
      if (!user) {
        return NextResponse.json({ error: "Sign in required." }, { status: 401 });
      }

      if (!invitationEmailMatchesUser(invitation.invitee_email, user.email)) {
        return NextResponse.json(
          { error: "This invitation belongs to a different email address." },
          { status: 403 }
        );
      }

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
