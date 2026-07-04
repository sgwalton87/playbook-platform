import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  buildSupportMessageRecord,
  canAccessScholarNetwork,
} from "@/lib/support-network-live/server";

export async function GET(req: NextRequest) {
  const scholarId = req.nextUrl.searchParams.get("scholarId");

  if (!scholarId) {
    return NextResponse.json({ error: "Missing scholarId" }, { status: 400 });
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
  const body = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return NextResponse.json({ message: data });
}
