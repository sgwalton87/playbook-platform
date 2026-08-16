import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const ALBUM_VISIBILITY = new Set(["public", "private"]);
const MAX_TITLE = 120;
const MAX_DESCRIPTION = 2000;

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Album ownership cannot be assigned to another user." }, { status: 403 });
    }

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "story").trim() || "story";
    const visibility = String(body.visibility ?? "public").trim().toLowerCase();
    if (!title || title.length > MAX_TITLE) return NextResponse.json({ error: `Album title is required and must be ${MAX_TITLE} characters or fewer.` }, { status: 400 });
    if (description.length > MAX_DESCRIPTION) return NextResponse.json({ error: `Album description must be ${MAX_DESCRIPTION} characters or fewer.` }, { status: 400 });
    if (!ALBUM_VISIBILITY.has(visibility)) return NextResponse.json({ error: "Album visibility must be public or private." }, { status: 400 });

    const { data, error } = await supabase.from("profile_albums").insert({
      user_id: user.id,
      title,
      description: description || null,
      category: category.slice(0, 80),
      visibility,
    }).select("id,user_id,title,description,category,visibility,cover_url,created_at,updated_at").single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, album: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create album." }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const requestedUserId = req.nextUrl.searchParams.get("userId") || user.id;
    const { data, error } = await supabase
      .from("profile_albums")
      .select("id,user_id,title,description,category,visibility,cover_url,created_at,updated_at,profile_album_photos(id,album_id,user_id,image_url,caption,sort_order,created_at)")
      .eq("user_id", requestedUserId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ albums: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load albums." }, { status: 400 });
  }
}
