import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const MAX_CAPTION = 1000;

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Photo ownership cannot be assigned to another user." }, { status: 403 });
    }

    const albumId = String(body.albumId ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();
    const caption = String(body.caption ?? "").trim();
    const sortOrder = Number(body.sortOrder ?? 0);
    if (!albumId || !imageUrl) return NextResponse.json({ error: "Album and image are required." }, { status: 400 });
    if (caption.length > MAX_CAPTION) return NextResponse.json({ error: `Photo caption must be ${MAX_CAPTION} characters or fewer.` }, { status: 400 });
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return NextResponse.json({ error: "Photo sort order must be a non-negative integer." }, { status: 400 });

    const album = await supabase
      .from("profile_albums")
      .select("id,user_id")
      .eq("id", albumId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (album.error) throw new Error(album.error.message);
    if (!album.data) return NextResponse.json({ error: "Owned album not found." }, { status: 404 });

    const { data, error } = await supabase.from("profile_album_photos").insert({
      album_id: albumId,
      user_id: user.id,
      image_url: imageUrl,
      caption: caption || null,
      sort_order: sortOrder,
    }).select("id,album_id,user_id,image_url,caption,sort_order,created_at").single();
    if (error) throw new Error(error.message);

    if (Boolean(body.makeCover)) {
      const cover = await supabase
        .from("profile_albums")
        .update({ cover_url: imageUrl, updated_at: new Date().toISOString() })
        .eq("id", albumId)
        .eq("user_id", user.id);
      if (cover.error) throw new Error(cover.error.message);
    }

    return NextResponse.json({ ok: true, photo: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add album photo." }, { status: 400 });
  }
}
