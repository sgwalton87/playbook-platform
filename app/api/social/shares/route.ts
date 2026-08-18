import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const CHANNELS = new Set(["native", "copy_link"]);

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Share ownership cannot be assigned to another user." }, { status: 403 });
    }

    const postId = String(body.postId ?? "").trim();
    const channel = String(body.channel ?? "").trim();
    if (!postId || !CHANNELS.has(channel)) {
      return NextResponse.json({ error: "A public post and supported share channel are required." }, { status: 400 });
    }

    const { data: post, error: postError } = await supabase
      .from("feed_posts")
      .select("id,visibility")
      .eq("id", postId)
      .eq("visibility", "public")
      .maybeSingle();
    if (postError) throw new Error(postError.message);
    if (!post) return NextResponse.json({ error: "Only public stories can be shared." }, { status: 403 });

    const { data, error } = await supabase
      .from("feed_post_shares")
      .insert({ post_id: postId, user_id: user.id, channel })
      .select("id,post_id,user_id,channel,created_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, share: data, path: `/story/${postId}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to record share." }, { status: 400 });
  }
}
