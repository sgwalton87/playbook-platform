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

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_post_comments")
    .insert({
      post_id: body.postId,
      user_id: body.userId,
      body: body.body.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("coin_ledger").insert({
    scholar_id: body.userId,
    event_type: "comment.created",
    source_id: body.postId,
    coins: 2,
    xp: 2,
    reason: "Participated in community discussion",
  });

  return NextResponse.json({ ok: true, comment: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const supabase = admin();

  if (!body.commentId || !body.userId || !body.body?.trim()) {
    return NextResponse.json({ error: "Missing comment edit data." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_post_comments")
    .update({ body: body.body.trim() })
    .eq("id", body.commentId)
    .eq("user_id", body.userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, comment: data });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const supabase = admin();

  if (!body.commentId || !body.userId) {
    return NextResponse.json({ error: "Missing comment delete data." }, { status: 400 });
  }

  const { error } = await supabase
    .from("feed_post_comments")
    .delete()
    .eq("id", body.commentId)
    .eq("user_id", body.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
