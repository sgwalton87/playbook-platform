import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const scholarId = req.nextUrl.searchParams.get("scholarId");

  if (!scholarId) {
    return NextResponse.json({ error: "Missing scholarId" }, { status: 400 });
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
