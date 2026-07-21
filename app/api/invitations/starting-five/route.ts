import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/lib/invitations/token";
import { sendStartingFiveInvite } from "@/lib/invitations/email";

export const runtime = "nodejs";

type RequestBody = {
  memberId?: string;
};

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.nextUrl.origin;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 },
      );
    }

    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as RequestBody;
    const memberId = body.memberId?.trim();

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required." },
        { status: 400 },
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: member, error: memberError } = await admin
      .from("support_network_members")
      .select(
        "id, scholar_id, full_name, email, role, is_starting_five, supporter_profile_id",
      )
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: "Support member not found." },
        { status: 404 },
      );
    }

    if (member.scholar_id !== user.id) {
      return NextResponse.json(
        { error: "You cannot invite this support member." },
        { status: 403 },
      );
    }

    if (!member.is_starting_five) {
      return NextResponse.json(
        { error: "This person is not in your Starting Five." },
        { status: 400 },
      );
    }

    if (member.supporter_profile_id) {
      return NextResponse.json(
        { error: "This supporter is already connected." },
        { status: 409 },
      );
    }

    if (!member.email) {
      return NextResponse.json(
        { error: "This supporter does not have an email address." },
        { status: 400 },
      );
    }

    const { data: scholarProfile } = await admin
      .from("profiles")
      .select("full_name, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    const scholarName =
      scholarProfile?.full_name?.trim() ||
      [scholarProfile?.first_name, scholarProfile?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      user.email ||
      "A Playbook scholar";

    const token = generateInvitationToken();
    const tokenHash = hashInvitationToken(token);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await admin
      .from("starting_five_invitations")
      .update({
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("member_id", member.id)
      .is("claimed_at", null)
      .is("revoked_at", null);

    const { data: invitation, error: invitationError } = await admin
      .from("starting_five_invitations")
      .insert({
        member_id: member.id,
        invited_email: member.email.toLowerCase().trim(),
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (invitationError || !invitation) {
      console.error(invitationError);

      return NextResponse.json(
        { error: "Unable to create invitation." },
        { status: 500 },
      );
    }

    const claimUrl = `${siteUrl.replace(/\/$/, "")}/claim/${token}`;

    try {
      await sendStartingFiveInvite({
        invitedEmail: member.email,
        supporterName: member.full_name || "Supporter",
        scholarName,
        supporterRole: member.role || "supporter",
        claimUrl,
      });
    } catch (emailError) {
      await admin
        .from("starting_five_invitations")
        .delete()
        .eq("id", invitation.id);

      throw emailError;
    }

    const sentAt = new Date().toISOString();

    await Promise.all([
      admin
        .from("starting_five_invitations")
        .update({
          sent_at: sentAt,
          updated_at: sentAt,
        })
        .eq("id", invitation.id),

      admin
        .from("support_network_members")
        .update({
          status: "invited",
          updated_at: sentAt,
        })
        .eq("id", member.id),
    ]);

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      expiresAt,
    });
  } catch (error) {
    console.error("Starting Five invitation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send invitation.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 },
      );
    }

    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 },
      );
    }

    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId required." },
        { status: 400 },
      );
    }

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: member } = await admin
      .from("support_network_members")
      .select("id, scholar_id")
      .eq("id", memberId)
      .single();

    if (!member || member.scholar_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 },
      );
    }

    const now = new Date().toISOString();

    await admin
      .from("starting_five_invitations")
      .update({
        revoked_at: now,
        updated_at: now,
      })
      .eq("member_id", memberId)
      .is("claimed_at", null)
      .is("revoked_at", null);

    await admin
      .from("support_network_members")
      .update({
        status: "draft",
        updated_at: now,
      })
      .eq("id", memberId);

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to cancel invitation.",
      },
      {
        status: 500,
      }
    );
  }
}

