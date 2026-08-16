import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const SUPPORTED_REACTIONS = new Set(["like"]);

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { postId?: unknown; reaction?: unknown };
  const reaction = String(body.reaction ?? "like").trim().toLowerCase();
  const postId = String(body.postId ?? "").trim();

  if (!postId) {
    return NextResponse.json({ error: "Missing post." }, { status: 400 });
  }
  if (!SUPPORTED_REACTIONS.has(reaction)) {
    return NextResponse.json({ error: "Unsupported reaction." }, { status: 400 });
  }

  const { data: post, error: postError } = await supabase
    .from("feed_posts")
    .select("id")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("feed_post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("reaction", reaction)
    .maybeSingle();
  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  if (existing?.id) {
    const removed = await supabase
      .from("feed_post_reactions")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (removed.error) return NextResponse.json({ error: removed.error.message }, { status: 400 });
    return NextResponse.json({ ok: true, liked: false });
  }

  const { data, error } = await supabase
    .from("feed_post_reactions")
    .insert({ post_id: postId, user_id: user.id, reaction })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Rewards are intentionally not minted from this user-facing route. The
  // governed reward issuer remains the only future authority for coins/XP.
  return NextResponse.json({ ok: true, liked: true, reaction: data });
}
