import { NextRequest, NextResponse } from "next/server";

import {
  buildInvitationEmail,
  buildInvitationRecord,
} from "@/lib/invitations/server";
import type { RelationshipKind } from "@/lib/permissions";
import { buildSupportInvitationEmail, sendPlaybookEmail } from "@/lib/email";
import { requireUser } from "@/lib/supabase/server";

const RELATIONSHIP_KINDS = new Set<RelationshipKind>([
  "parent_guardian",
  "educator",
  "mentor",
  "district_admin",
  "university_partner",
  "employer_partner",
]);

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const relationship = body.relationship as RelationshipKind | undefined;
    const inviteeName = String(body.inviteeName || "").trim();
    const inviteeEmail = String(body.inviteeEmail || "").trim().toLowerCase();

    if (!relationship || !RELATIONSHIP_KINDS.has(relationship)) {
      return NextResponse.json({ error: "Invalid support relationship." }, { status: 400 });
    }
    if (!inviteeName || !inviteeEmail) {
      return NextResponse.json({ error: "Invitee name and email are required." }, { status: 400 });
    }

    const record = buildInvitationRecord({
      scholarId: user.id,
      scholarName: body.scholarName || "Scholar",
      inviteeName,
      inviteeEmail,
      relationship,
    });

    const { error } = await supabase
      .from("support_invitations")
      .insert({
        id: record.id,
        scholar_id: record.scholarId,
        scholar_name: record.scholarName,
        invitee_name: record.inviteeName,
        invitee_email: record.inviteeEmail,
        relationship: record.relationship,
        status: record.status,
        token: record.token,
        permissions: record.permissions,
        destination: record.destination,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const email = buildInvitationEmail({
      inviteeName: record.inviteeName,
      scholarName: record.scholarName,
      relationship: record.relationship,
      token: record.token,
      origin: req.nextUrl.origin,
    });

    const invitationEmail = buildSupportInvitationEmail({
      inviteeName: record.inviteeName,
      scholarName: record.scholarName,
      relationship: record.relationship,
      url: email.url,
    });

    try {
      await sendPlaybookEmail({
        to: record.inviteeEmail,
        subject: invitationEmail.subject,
        text: invitationEmail.text,
        html: invitationEmail.html,
        fromType: "onboarding",
      });
    } catch (deliveryError) {
      // The invitation remains durable and visible to its scholar owner. Email
      // delivery is an external transport concern and may be retried without
      // silently deleting the consent artifact.
      return NextResponse.json(
        {
          ok: true,
          invitation: record,
          email,
          deliveryStatus: "failed",
          deliveryError: deliveryError instanceof Error ? deliveryError.message : "Invitation delivery failed.",
        },
        { status: 202 }
      );
    }

    return NextResponse.json({
      ok: true,
      invitation: record,
      email,
      deliveryStatus: "sent",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create invitation." },
      { status: 500 }
    );
  }
}
