import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = admin();

  const { data, error } = await supabase.from("profile_album_photos").insert({
    album_id: body.albumId,
    user_id: body.userId,
    image_url: body.imageUrl,
    caption: body.caption || null,
    sort_order: body.sortOrder || 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("profile_albums").update({
    cover_url: body.makeCover ? body.imageUrl : undefined,
    updated_at: new Date().toISOString(),
  }).eq("id", body.albumId);

  return NextResponse.json({ ok: true, photo: data });
}
