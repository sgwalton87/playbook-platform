import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const TARGET_TYPES = new Set([
  "post",
  "comment",
  "profile",
  "event",
  "album",
]);

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const targetType = String(body.targetType || "");
  const targetId = String(body.targetId || "");
  const reason = String(body.reason || "").trim();
  const detail = String(body.detail || "").trim();

  if (!TARGET_TYPES.has(targetType) || !targetId || !reason || reason.length > 160 || detail.length > 2000) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  if (targetType === "post") {
    const { data: post, error: postError } = await supabase
      .from("feed_posts")
      .select("id")
      .eq("id", targetId)
      .eq("visibility", "public")
      .eq("moderation_state", "visible")
      .maybeSingle();

    if (postError || !post) {
      return NextResponse.json({ error: "This story is not available to report." }, { status: 404 });
    }
  }

  const { data, error } = await supabase
    .from("moderation_reports")
    .insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      detail: detail || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, report: data });
}
