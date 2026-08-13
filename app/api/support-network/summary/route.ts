import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const requestedScholarId = req.nextUrl.searchParams.get("scholarId");
  const scholarId = requestedScholarId || user.id;

  if (requestedScholarId && requestedScholarId !== user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const [relationships, invitations, messages, actions] = await Promise.all([
    supabase.from("support_relationships").select("*").eq("scholar_id", scholarId),
    supabase.from("support_invitations").select("*").eq("scholar_id", scholarId),
    supabase.from("support_messages").select("*").eq("scholar_id", scholarId),
    supabase.from("shared_actions").select("*").eq("scholar_id", scholarId),
  ]);

  return NextResponse.json({
    relationships: relationships.data || [],
    invitations: invitations.data || [],
    messages: messages.data || [],
    actions: actions.data || [],
  });
}
