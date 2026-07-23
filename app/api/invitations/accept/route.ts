import { NextRequest, NextResponse } from "next/server";
import {
  applyInvitationStatus,
  buildInvitationAcceptanceEffects,
} from "@/lib/invitations/server";
import type { InvitationStatus } from "@/lib/invitations";
import {
  onboardingDestinationForInvitation,
  requiresInvitationRoleOnboarding,
  roleForSupportInvitation,
} from "@/lib/invitations";
import { invitationEmailMatchesUser } from "@/lib/support-relationships";
import { normalizePlaybookRole } from "@/lib/roles/registry";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await req.json();
    const token = body.token as string | undefined;
    const status = (body.status || "accepted") as InvitationStatus;

    if (!token) return NextResponse.json({ error: "Missing invitation token." }, { status: 400 });
    if (status !== "accepted" && status !== "declined") {
      return NextResponse.json({ error: "Invalid invitation status." }, { status: 400 });
    }

    const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { data: invitation, error: readError } = await supabase
      .from("support_invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (readError || !invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (!invitationEmailMatchesUser(invitation.invitee_email, user.email)) {
      return NextResponse.json({ error: "This invitation belongs to a different email address." }, { status: 403 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({
        error: `Invitation is already ${invitation.status}.`,
        destination: invitation.destination,
      }, { status: 409 });
    }

    if (status === "declined") {
      const update = applyInvitationStatus("declined");
      const { error } = await supabase.from("support_invitations").update(update).eq("id", invitation.id).eq("status", "pending");
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, destination: invitation.destination, invitation: { ...invitation, ...update } });
    }

    const invitedRole = roleForSupportInvitation(
      invitation.relationship,
      invitation.invited_role,
    );
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,profile_mode,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    const profileRole = normalizePlaybookRole(
      profile?.profile_mode || profile?.role,
    );

    if (requiresInvitationRoleOnboarding({
      onboardingCompleted: profile?.onboarding_completed,
      profileRole,
      invitedRole,
    })) {
      return NextResponse.json({
        ok: true,
        requiresOnboarding: true,
        invitedRole,
        onboardingDestination: onboardingDestinationForInvitation({
          token,
          relationship: invitation.relationship,
          invitedRole,
        }),
        destination: invitation.destination,
      });
    }

    const effects = buildInvitationAcceptanceEffects({ invitation, supporterId: user.id });

    const { error: relationshipError } = await supabase
      .from("support_relationships")
      .upsert(effects.relationship, { onConflict: "source_invitation_id" });
    if (relationshipError) return NextResponse.json({ error: relationshipError.message }, { status: 400 });

    const writes = await Promise.all([
      supabase.from("support_messages").upsert(effects.message, { onConflict: "id" }),
      supabase.from("playbook_events").upsert(effects.event, { onConflict: "id" }),
      supabase.from("notifications").upsert(effects.notification, { onConflict: "id" }),
    ]);
    const sideEffectError = writes.find((result) => result.error)?.error;
    if (sideEffectError) return NextResponse.json({ error: sideEffectError.message }, { status: 400 });

    const { error: updateError } = await supabase
      .from("support_invitations")
      .update(effects.invitationUpdate)
      .eq("id", invitation.id)
      .eq("status", "pending");
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    return NextResponse.json({
      ok: true,
      destination: invitation.destination,
      message: effects.message,
      notification: effects.notification,
      invitation: { ...invitation, ...effects.invitationUpdate },
    });
  } catch {
    return NextResponse.json({ error: "Unable to process invitation." }, { status: 500 });
  }
}
