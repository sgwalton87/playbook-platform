import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const MAX_COMMENT_LENGTH = 4000;

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Comment ownership cannot be assigned to another user." }, { status: 403 });
    }
    const postId = String(body.postId ?? "").trim();
    const commentBody = String(body.body ?? "").trim();
    if (!postId || !commentBody) return NextResponse.json({ error: "Post and comment are required." }, { status: 400 });
    if (commentBody.length > MAX_COMMENT_LENGTH) return NextResponse.json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.` }, { status: 400 });

    const { data, error } = await supabase
      .from("feed_post_comments")
      .insert({ post_id: postId, user_id: user.id, body: commentBody })
      .select("id,post_id,user_id,body,created_at,updated_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      comment: data,
      rewardState: "governed_reward_issuer_pending",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create comment." }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Comment ownership cannot be assigned to another user." }, { status: 403 });
    }
    const commentId = String(body.commentId ?? "").trim();
    const commentBody = String(body.body ?? "").trim();
    if (!commentId || !commentBody) return NextResponse.json({ error: "Comment edit data is required." }, { status: 400 });
    if (commentBody.length > MAX_COMMENT_LENGTH) return NextResponse.json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.` }, { status: 400 });

    const { data, error } = await supabase
      .from("feed_post_comments")
      .update({ body: commentBody, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("user_id", user.id)
      .select("id,post_id,user_id,body,created_at,updated_at")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, comment: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to edit comment." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await req.json() as Record<string, unknown>;
    if (body.userId != null && String(body.userId) !== user.id) {
      return NextResponse.json({ error: "Comment ownership cannot be assigned to another user." }, { status: 403 });
    }
    const commentId = String(body.commentId ?? "").trim();
    if (!commentId) return NextResponse.json({ error: "Comment ID is required." }, { status: 400 });

    const { error } = await supabase
      .from("feed_post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete comment." }, { status: 400 });
  }
}
