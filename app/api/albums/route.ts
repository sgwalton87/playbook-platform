import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = admin();

  const { data, error } = await supabase.from("profile_albums").insert({
    user_id: body.userId,
    title: body.title,
    description: body.description || null,
    category: body.category || "story",
    visibility: body.visibility || "public",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, album: data });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data, error } = await admin()
    .from("profile_albums")
    .select("*, profile_album_photos(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ albums: data || [] });
}
