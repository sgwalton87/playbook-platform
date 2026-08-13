import { NextRequest, NextResponse } from "next/server";


import {
  buildInvitationEmail,
  buildInvitationRecord,
} from "@/lib/invitations/server";
import { parseInvitationSendPayload } from "@/lib/api/contracts/invitations";
import { buildSupportInvitationEmail, sendPlaybookEmail } from "@/lib/email";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const parsed = parseInvitationSendPayload(payload);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const record = buildInvitationRecord({
      scholarId: user.id,
      scholarName: parsed.value.scholarName,
      inviteeName: parsed.value.inviteeName,
      inviteeEmail: parsed.value.inviteeEmail,
      relationship: parsed.value.relationship,
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
