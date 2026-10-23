import { NextRequest, NextResponse } from "next/server";

import {
  buildInvitationEmail,
  buildInvitationRecord,
} from "@/lib/invitations/server";
import type { RelationshipKind } from "@/lib/permissions";
import { buildSupportInvitationEmail, buildScholarInvitationReceipt, sendPlaybookEmail } from "@/lib/email";
import { requirePlaybookRole } from "@/lib/roles/registry";
import { requireUser } from "@/lib/supabase/server";

const RELATIONSHIP_KINDS = new Set<RelationshipKind>([
  "parent_guardian",
  "educator",
  "counselor",
  "mentor",
  "coach",
  "district_admin",
  "college_recruiter",
  "college_admissions",
  "community_partner",
  "brand_partner",
  "employer_partner",
]);

const SCHOLAR_RECORD_ROLES = new Set([
  "scholar",
  "scholar-athlete",
  "transition-youth",
]);

export async function GET() {
  return NextResponse.json(
    { ok: true, route: "invitations.send", health: "ready" },
    { status: 200 }
  );
}

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

    let inviterRole: string;
    try {
      inviterRole = requirePlaybookRole(inviterProfile.data?.profile_mode ?? inviterProfile.data?.role);
    } catch {
      return NextResponse.json({ error: "A valid Scholar Record role is required to send invitations." }, { status: 403 });
    }
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
      return NextResponse.json({ error: "Invalid or legacy support relationship. Choose the exact role relationship." }, { status: 400 });
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
        invite_code: record.inviteCode,
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
      inviteCode: record.inviteCode,
    });

    // Preserve the saved private invitation even when email service is unconfigured.
    // Never claim delivery or leak SMTP credentials to the browser.
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        ok: true, invitation: record, email,
        deliveryStatus: "failed",
        deliveryError: "Invitation saved, but email delivery is not configured. The invited person can sign in and open /invitations/received using the exact invited email.",
      }, { status: 202 });
    }

    try {
      await sendPlaybookEmail({
        to: record.inviteeEmail,
        subject: invitationEmail.subject,
        text: invitationEmail.text,
        html: invitationEmail.html,
        fromType: "onboarding",
      });
    } catch (deliveryError) {
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

    // Receipt is separate from the recipient's invitation. A receipt failure
    // must not falsely fail or undo an invitation that was actually sent.
    let scholarReceiptStatus: "sent" | "failed" = "failed";
    if (user.email) {
      try {
        const receipt = buildScholarInvitationReceipt({
          scholarName, inviteeName, inviteeEmail,
          relationship, url: email.url, inviteCode: record.inviteCode,
        });
        await sendPlaybookEmail({
          to: user.email, subject: receipt.subject, text: receipt.text,
          html: receipt.html, fromType: "notifications",
        });
        scholarReceiptStatus = "sent";
      } catch { /* The saved invitation and original delivery remain intact. */ }
    }
    return NextResponse.json({
      ok: true, invitation: record, email,
      deliveryStatus: "sent", scholarReceiptStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create invitation." },
      { status: 500 }
    );
  }
}
