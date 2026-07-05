import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { hasExistingReward } from "@/lib/trust/rewardGuard";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const reaction = body.reaction || "like";

  if (!body.postId) {
    return NextResponse.json(
      { error: "Missing post." },
      { status: 400 }
    );
  }

  const { data: post } = await supabase
    .from("feed_posts")
    .select("user_id")
    .eq("id", body.postId)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: "Post not found." },
      { status: 404 }
    );
  }

  const { data: existing } = await supabase
    .from("feed_post_reactions")
    .select("id")
    .eq("post_id", body.postId)
    .eq("user_id", user.id)
    .eq("reaction", reaction)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("feed_post_reactions")
      .delete()
      .eq("id", existing.id);

    return NextResponse.json({
      ok: true,
      liked: false,
    });
  }

  const { data, error } = await supabase
    .from("feed_post_reactions")
    .insert({
      post_id: body.postId,
      user_id: user.id,
      reaction,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // No reward for reacting to your own post.
  if (post.user_id !== user.id) {
    const rewarded = await hasExistingReward(supabase, {
      scholarId: user.id,
      eventType: "reaction.created",
      sourceId: body.postId,
    });

    if (!rewarded) {
      await supabase
        .from("coin_ledger")
        .insert({
          scholar_id: user.id,
          event_type: "reaction.created",
          source_id: body.postId,
          coins: 1,
          xp: 1,
          reason: "Encouraged a peer",
        });
    }
  }

  return NextResponse.json({
    ok: true,
    liked: true,
    reaction: data,
  });
}
