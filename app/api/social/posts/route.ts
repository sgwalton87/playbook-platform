import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const MAX_POST_LENGTH = 4000;
const CATEGORIES = new Set(["leadership", "finance", "civic", "sel", "college", "nil", "community"]);

type DeletedPost = {
  id?: string;
  image_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
};

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const payload = await req.json() as Record<string, unknown>;
    if (payload.userId != null && String(payload.userId) !== user.id) {
      return NextResponse.json({ error: "Post ownership cannot be assigned to another user." }, { status: 403 });
    }

    const postId = String(payload.postId ?? "").trim();
    const body = String(payload.body ?? "").trim();
    const category = String(payload.category ?? "").trim().toLowerCase();

    if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    if (body.length > MAX_POST_LENGTH) return NextResponse.json({ error: `Story must be ${MAX_POST_LENGTH} characters or fewer.` }, { status: 400 });
    if (!CATEGORIES.has(category)) return NextResponse.json({ error: "Choose a valid story category." }, { status: 400 });

    const { data, error } = await supabase.rpc("update_feed_post_owner", {
      p_post_id: postId,
      p_body: body,
      p_post_type: category,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, post: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to edit post." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const payload = await req.json() as Record<string, unknown>;
    if (payload.userId != null && String(payload.userId) !== user.id) {
      return NextResponse.json({ error: "Post ownership cannot be assigned to another user." }, { status: 403 });
    }

    const postId = String(payload.postId ?? "").trim();
    if (!postId) return NextResponse.json({ error: "Post ID is required." }, { status: 400 });

    const { data, error } = await supabase.rpc("delete_feed_post_owner", { p_post_id: postId });
    if (error) throw new Error(error.message);

    const deleted = (data || {}) as DeletedPost;
    const cleanupErrors: string[] = [];

    const imagePath = storagePathForOwner(deleted.image_url, "photos", user.id);
    if (imagePath) {
      const result = await supabase.storage.from("photos").remove([imagePath]);
      if (result.error) cleanupErrors.push(`image: ${result.error.message}`);
    }

    const videoPath = storagePathForOwner(deleted.media_type === "video" ? deleted.media_url : null, "feed-videos", user.id);
    if (videoPath) {
      const result = await supabase.storage.from("feed-videos").remove([videoPath]);
      if (result.error) cleanupErrors.push(`video: ${result.error.message}`);
    }

    return NextResponse.json({
      ok: true,
      deletedPostId: deleted.id || postId,
      mediaCleanup: cleanupErrors.length ? "failed" : "complete",
      warning: cleanupErrors.length ? `Story deleted, but media cleanup needs attention: ${cleanupErrors.join("; ")}` : null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete post." }, { status: 400 });
  }
}

function storagePathForOwner(urlValue: string | null | undefined, bucket: "photos" | "feed-videos", userId: string) {
  if (!urlValue) return null;
  try {
    const parsed = new URL(urlValue);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    const encodedPath = parsed.pathname.slice(markerIndex + marker.length);
    const path = encodedPath.split("/").map((segment) => decodeURIComponent(segment)).join("/");
    return path.startsWith(`${userId}/feed/`) ? path : null;
  } catch {
    return null;
  }
}
