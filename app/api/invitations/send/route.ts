import { NextRequest, NextResponse } from "next/server";


import {
  buildInvitationEmail,
  buildInvitationRecord,
} from "@/lib/invitations/server";

import type { RelationshipKind } from "@/lib/permissions";
import { buildSupportInvitationEmail, sendPlaybookEmail } from "@/lib/email";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { captureOperationalError, incrementMetric } from "@/lib/observability";

const RELATIONSHIPS: RelationshipKind[] = ["parent_guardian", "educator", "mentor", "district_admin", "university_partner", "employer_partner"];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("support_invitations")
    .select("id,scholar_id,scholar_name,invitee_name,invitee_email,relationship,status,permissions,destination,created_at,responded_at")
    .order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ invitations: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

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

    const relationship = body.relationship as RelationshipKind;
    if (!RELATIONSHIPS.includes(relationship) || !String(body.inviteeEmail || "").includes("@")) {
      return NextResponse.json({ error: "A valid supporter relationship and email are required." }, { status: 422 });
    }

    const { data: profile } = await supabase.from("profiles").select("full_name,username").eq("id", user.id).maybeSingle();
    const record = buildInvitationRecord({
      scholarId: user.id,
      scholarName: profile?.full_name || profile?.username || "Scholar",
      inviteeName: body.inviteeName,
      inviteeEmail: body.inviteeEmail,
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

    incrementMetric("invitation_total");

    return NextResponse.json({
      ok: true,
      invitation: record,
      email,
      deliveryStatus: "sent",
    });
  } catch (error: unknown) {
    await captureOperationalError(error, { service: "playbook-communications", component: "invitations", operation: "send_invitation" });
    return NextResponse.json(
      { error: "Unable to create invitation." },
      { status: 500 }
    );
  }
}
