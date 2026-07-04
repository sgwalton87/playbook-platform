import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabaseClient";

import {
  buildInvitationEmail,
  buildInvitationRecord,
} from "@/lib/invitations/server";

import type { RelationshipKind } from "@/lib/permissions";
import { buildSupportInvitationEmail, sendPlaybookEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const record = buildInvitationRecord({
      scholarId: user.id,
      scholarName: body.scholarName || "Scholar",
      inviteeName: body.inviteeName,
      inviteeEmail: body.inviteeEmail,
      relationship: body.relationship as RelationshipKind,
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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
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

    await sendPlaybookEmail({
      to: record.inviteeEmail,
      subject: invitationEmail.subject,
      text: invitationEmail.text,
      html: invitationEmail.html,
      fromType: "onboarding",
    });

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
