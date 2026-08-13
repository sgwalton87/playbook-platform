import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const userId = body.userId || user.id;

  if (body.userId && body.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase.from("profile_album_photos").insert({
    album_id: body.albumId,
    user_id: userId,
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
