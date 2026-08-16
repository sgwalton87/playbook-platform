import { NextRequest, NextResponse } from "next/server";

import {
  buildInvitationEmail,
  buildInvitationRecord,
} from "@/lib/invitations/server";
import type { RelationshipKind } from "@/lib/permissions";
import { buildSupportInvitationEmail, sendPlaybookEmail } from "@/lib/email";
import { normalizePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

const RELATIONSHIP_KINDS = new Set<RelationshipKind>([
  "parent_guardian",
  "educator",
  "mentor",
  "district_admin",
  "university_partner",
  "employer_partner",
]);

const SCHOLAR_RECORD_ROLES = new Set([
  "scholar",
  "scholar-athlete",
  "transition-youth",
]);

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inviterProfile = await supabase
      .from("profiles")
      .select("role,profile_mode,full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (inviterProfile.error) {
      return NextResponse.json({ error: inviterProfile.error.message }, { status: 400 });
    }

    const inviterRole = normalizePlaybookRole(
      inviterProfile.data?.profile_mode ?? inviterProfile.data?.role
    );
    if (!SCHOLAR_RECORD_ROLES.has(inviterRole)) {
      return NextResponse.json(
        { error: "Only a self-owned Scholar Record account may invite members into its support system." },
        { status: 403 }
      );
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
    if (user.email?.trim().toLowerCase() === inviteeEmail) {
      return NextResponse.json({ error: "A Scholar cannot invite the same account as its own supporter." }, { status: 400 });
    }

    const scholarName = String(inviterProfile.data?.full_name || "Scholar").trim();
    const record = buildInvitationRecord({
      scholarId: user.id,
      scholarName,
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
      // The invitation remains durable and visible to its Scholar owner. Email
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
