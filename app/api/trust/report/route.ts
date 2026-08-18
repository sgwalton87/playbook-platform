import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const TARGET_TYPES = new Set([
  "post",
  "comment",
  "profile",
  "event",
  "album",
]);

const PROFILE_REPORT_REASONS = new Set([
  "Harassment or bullying",
  "Spam or scam",
  "Impersonation",
  "Threats or unsafe behavior",
  "Other",
]);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ReportRequest = {
  targetType?: unknown;
  targetId?: unknown;
  reason?: unknown;
  detail?: unknown;
  conversationId?: unknown;
  sourceMessageId?: unknown;
};

function reportErrorStatus(code?: string) {
  if (code === "42501") return 403;
  if (code === "P0002") return 404;
  return 400;
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ReportRequest;
  try {
    body = await req.json() as ReportRequest;
  } catch {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  const targetType = String(body.targetType ?? "");
  const targetId = String(body.targetId ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const detail = String(body.detail ?? "").trim();

  if (!TARGET_TYPES.has(targetType) || !targetId || !reason || reason.length > 160 || detail.length > 2000) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  if (targetType === "profile") {
    const conversationId = String(body.conversationId ?? "").trim();
    const sourceMessageId = String(body.sourceMessageId ?? "").trim();

    if (
      !UUID_PATTERN.test(targetId)
      || !UUID_PATTERN.test(conversationId)
      || (sourceMessageId && !UUID_PATTERN.test(sourceMessageId))
      || !PROFILE_REPORT_REASONS.has(reason)
      || targetId === user.id
    ) {
      return NextResponse.json({ error: "Invalid Messaging user report." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("report_governed_messaging_user", {
      requested_conversation_id: conversationId,
      requested_user_id: targetId,
      requested_reason: reason,
      requested_detail: detail || null,
      requested_message_id: sourceMessageId || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: reportErrorStatus(error.code) });
    }

    return NextResponse.json({ ok: true, report: data });
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
