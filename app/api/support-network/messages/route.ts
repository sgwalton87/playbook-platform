import { NextRequest, NextResponse } from "next/server";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const scholarId = request.nextUrl.searchParams.get("scholarId");
  const authorization = await resolveServerAuthorization({ scholarId, permission: "view_progress" });
  if (!authorization.authorized) return NextResponse.json({ error: "Active Scholar relationship with progress access required." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("support_messages").select("id,scholar_id,relationship_id,sender_id,sender_role,recipient_id,body,visibility,created_at,edited_at").eq("scholar_id", authorization.scholarId).is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ scholarId: authorization.scholarId, messages: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!body.scholarId || !body.recipientId || !String(body.body || "").trim()) return NextResponse.json({ error: "Scholar, recipient, and message are required." }, { status: 422 });
  const { data, error } = await supabase.rpc("create_support_message", { p_scholar_id: body.scholarId, p_recipient_id: body.recipientId, p_body: String(body.body).trim(), p_visibility: body.visibility || "participants" });
  return error ? NextResponse.json({ error: "Message creation requires an active participant relationship." }, { status: 403 }) : NextResponse.json({ ok: true, message: data }, { status: 201 });
}
