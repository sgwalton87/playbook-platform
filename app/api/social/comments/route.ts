import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.postId || !body.body?.trim()) {
    return NextResponse.json({ error: "Post id and comment body are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_post_comments")
    .insert({
      post_id: body.postId,
      user_id: user.id,
      body: body.body.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("coin_ledger").insert({
    scholar_id: user.id,
    event_type: "comment.created",
    source_id: body.postId,
    coins: 2,
    xp: 2,
    reason: "Participated in community discussion",
  });

  return NextResponse.json({ ok: true, comment: data });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.commentId || !body.body?.trim()) {
    return NextResponse.json({ error: "Missing comment edit data." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feed_post_comments")
    .update({ body: body.body.trim() })
    .eq("id", body.commentId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, comment: data });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.commentId) {
    return NextResponse.json({ error: "Missing comment delete data." }, { status: 400 });
  }

  const { error } = await supabase
    .from("feed_post_comments")
    .delete()
    .eq("id", body.commentId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
