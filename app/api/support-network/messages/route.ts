import { NextRequest, NextResponse } from "next/server";
import {
  buildSupportMessageRecord,
  canAccessScholarNetwork,
} from "@/lib/support-network-live/server";
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

  const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: relationships } = await supabase
    .from("support_relationships")
    .select("*")
    .eq("scholar_id", scholarId);

  if (!canAccessScholarNetwork({ relationships: relationships || [], scholarId, userId: user.id, userEmail: user.email })) {
    return NextResponse.json({ error: "No relationship access." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("scholar_id", scholarId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ messages: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const body = await req.json();

  const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scholarId = body.scholarId;

  const { data: relationships } = await supabase
    .from("support_relationships")
    .select("*")
    .eq("scholar_id", scholarId);

  const allowed = canAccessScholarNetwork({
    relationships: relationships || [],
    scholarId,
    userId: user.id,
    userEmail: user.email,
  });

  if (!allowed) {
    return NextResponse.json({ error: "No relationship access." }, { status: 403 });
  }

  const record = buildSupportMessageRecord({
    scholarId,
    senderId: user.id,
    senderRole: body.senderRole || "supporter",
    body: body.body,
  });

  const { data, error } = await supabase
    .from("support_messages")
    .insert(record)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("playbook_events").insert({
    type: "message.received",
    scholar_id: scholarId,
    actor_id: user.id,
    actor_role: body.senderRole || "supporter",
    payload: {
      title: "New support message",
      detail: body.body,
    },
  });

  return NextResponse.json({ message: data });
}
