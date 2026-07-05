import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = admin();

  const { data: existing } = await supabase
    .from("feed_post_reactions")
    .select("id")
    .eq("post_id", body.postId)
    .eq("user_id", body.userId)
    .eq("reaction", body.reaction || "like")
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("feed_post_reactions").delete().eq("id", existing.id);
    return NextResponse.json({ ok: true, liked: false });
  }

  const { data, error } = await supabase
    .from("feed_post_reactions")
    .insert({
      post_id: body.postId,
      user_id: body.userId,
      reaction: body.reaction || "like",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("coin_ledger").insert({
    scholar_id: body.userId,
    event_type: "reaction.created",
    source_id: body.postId,
    coins: 1,
    xp: 1,
    reason: "Encouraged a peer",
  });

  return NextResponse.json({ ok: true, liked: true, reaction: data });
}
