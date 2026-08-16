import { NextRequest, NextResponse } from "next/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";
import { requireUser } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });

    const requestedScholarId = req.nextUrl.searchParams.get("scholarId");
    if (requestedScholarId && requestedScholarId !== user.id) {
      return NextResponse.json({ error: "Support-network summary is private to the authenticated learner." }, { status: 403 });
    }

    const [relationships, invitations, messages, actions] = await Promise.all([
      supabase.from("support_relationships")
        .select("id,scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,status,created_at,ended_at")
        .eq("scholar_id", user.id),
      supabase.from("support_invitations")
        .select("id,scholar_id,invitee_email,invitee_name,relationship,permissions,status,destination,created_at,accepted_at,declined_at")
        .eq("scholar_id", user.id),
      supabase.from("support_messages")
        .select("id,scholar_id,sender_user_id,recipient_user_id,body,created_at")
        .eq("scholar_id", user.id),
      supabase.from("shared_actions")
        .select("id,scholar_id,created_by,assigned_to,title,status,due_at,created_at")
        .eq("scholar_id", user.id),
    ]);

    for (const result of [relationships, invitations, messages, actions]) {
      if (result.error) throw new Error(result.error.message);
    }

    return NextResponse.json({
      relationships: relationships.data || [],
      invitations: invitations.data || [],
      messages: messages.data || [],
      actions: actions.data || [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load support-network summary." }, { status: 400 });
  }
}
