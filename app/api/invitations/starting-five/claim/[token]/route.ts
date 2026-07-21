import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server configuration is incomplete.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function findInvitation(token: string) {
  const admin = getAdminClient();
  const tokenHash = hashToken(token);

  const { data: invitation, error } = await admin
    .from("starting_five_invitations")
    .select(`
      id,
      member_id,
      invited_email,
      expires_at,
      claimed_at,
      revoked_at,
      support_network_members!inner (
        id,
        scholar_id,
        full_name,
        role,
        relationship,
        status,
        supporter_profile_id,
        profiles!support_network_members_scholar_id_fkey (
          full_name,
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("Invitation lookup error:", error);
    throw new Error("Unable to validate invitation.");
  }

  return { admin, invitation };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const { invitation } = await findInvitation(token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 },
      );
    }

    if (invitation.revoked_at) {
      return NextResponse.json(
        { error: "This invitation has been revoked." },
        { status: 410 },
      );
    }

    if (invitation.claimed_at) {
      return NextResponse.json(
        { error: "This invitation has already been claimed." },
        { status: 409 },
      );
    }

    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 },
      );
    }

    const member = Array.isArray(invitation.support_network_members)
      ? invitation.support_network_members[0]
      : invitation.support_network_members;

    const scholarProfile = Array.isArray(member?.profiles)
      ? member.profiles[0]
      : member?.profiles;

    const scholarName =
      scholarProfile?.full_name?.trim() ||
      [scholarProfile?.first_name, scholarProfile?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "A Playbook scholar";

    return NextResponse.json({
      valid: true,
      email: invitation.invited_email,
      supporterName: member?.full_name || "Supporter",
      supporterRole: member?.role || member?.relationship || "supporter",
      scholarName,
      scholarAvatarUrl: scholarProfile?.avatar_url || null,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    console.error("Invitation validation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to validate invitation.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as {
      password?: string;
      fullName?: string;
    };

    const password = body.password?.trim();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const { admin, invitation } = await findInvitation(token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 },
      );
    }

    if (
      invitation.revoked_at ||
      invitation.claimed_at ||
      new Date(invitation.expires_at).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "This invitation is no longer active." },
        { status: 410 },
      );
    }

    const member = Array.isArray(invitation.support_network_members)
      ? invitation.support_network_members[0]
      : invitation.support_network_members;

    const email = invitation.invited_email.toLowerCase().trim();
    const fullName =
      body.fullName?.trim() ||
      member?.full_name?.trim() ||
      "Playbook Supporter";

    const { data: createdUser, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "supporter",
          invitation_type: "starting_five",
          supporter_role: member?.role || member?.relationship || null,
        },
      });

    if (createError) {
      const message = createError.message.toLowerCase();

      if (
        message.includes("already") ||
        message.includes("registered") ||
        message.includes("exists")
      ) {
        return NextResponse.json(
          {
            error:
              "An account already exists for this email. Sign in to claim your invitation.",
            code: "ACCOUNT_EXISTS",
            email,
          },
          { status: 409 },
        );
      }

      throw createError;
    }

    if (!createdUser.user) {
      throw new Error("Unable to create supporter account.");
    }

    await admin
      .from("profiles")
      .upsert(
        {
          id: createdUser.user.id,
          full_name: fullName,
          role: "supporter",
          onboarding_complete: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("Supporter account creation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create supporter account.",
      },
      { status: 500 },
    );
  }
}
