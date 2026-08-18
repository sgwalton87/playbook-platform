import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

type ProfileReportContext = {
  report_id: string;
  target_user_id: string | null;
  username: string | null;
  full_name: string | null;
  source_conversation_id: string | null;
  conversation_kind: string | null;
  source_message_id: string | null;
  source_message_body: string | null;
  source_message_sender_id: string | null;
  source_message_created_at: string | null;
};

async function requireModerator() {
  const auth = await requireUser();
  if (!auth.user) return { ...auth, allowed: false };
  const { data: profile } = await auth.supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  return { ...auth, allowed: ["founder", "admin"].includes(profile?.role || "") };
}

export async function GET() {
  const { supabase, allowed } = await requireModerator();
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("moderation_reports")
    .select("*")
    .in("status", ["open", "reviewing", "resolved"])
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const reports = data || [];
  const postIds = [...new Set(reports.filter((report) => report.target_type === "post").map((report) => report.target_id))];
  const states = new Map<string, string>();
  if (postIds.length) {
    const postsResult = await supabase.rpc("get_moderation_feed_posts", { p_post_ids: postIds });
    if (postsResult.error) return NextResponse.json({ error: postsResult.error.message }, { status: 400 });
    for (const post of postsResult.data || []) states.set(post.id, post.moderation_state || "visible");
  }

  const profileReportIds = reports
    .filter((report) => report.target_type === "profile")
    .map((report) => report.id);
  const profileContexts = new Map<string, ProfileReportContext>();
  if (profileReportIds.length) {
    const contextResult = await supabase.rpc("get_moderation_profile_report_context", {
      requested_report_ids: profileReportIds,
    });
    if (contextResult.error) return NextResponse.json({ error: contextResult.error.message }, { status: 400 });
    for (const context of (contextResult.data || []) as ProfileReportContext[]) {
      profileContexts.set(context.report_id, context);
    }
  }

  const hydrated = reports.map((report) => {
    const profileContext = profileContexts.get(report.id);
    return {
      ...report,
      target_moderation_state: report.target_type === "post" ? (states.get(report.target_id) || "unavailable") : null,
      target_profile: profileContext ? {
        id: profileContext.target_user_id,
        username: profileContext.username,
        full_name: profileContext.full_name,
      } : null,
      source_context: profileContext ? {
        conversation_id: profileContext.source_conversation_id,
        conversation_kind: profileContext.conversation_kind,
        message_id: profileContext.source_message_id,
        message_body: profileContext.source_message_body,
        message_sender_id: profileContext.source_message_sender_id,
        message_created_at: profileContext.source_message_created_at,
      } : null,
    };
  });

  return NextResponse.json({
    reports: hydrated.filter((report) => report.status !== "resolved" || report.target_moderation_state === "hidden"),
  });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, allowed } = await requireModerator();
  if (!allowed || !user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const reportId = String(body.reportId || "");
  const note = String(body.note || "").trim();
  const action = String(body.action || "");

  if (action === "hide_content" || action === "restore_content") {
    const postId = String(body.postId || "");
    if (!postId) return NextResponse.json({ error: "Feed post ID is required." }, { status: 400 });
    const { data, error } = await supabase.rpc("moderate_feed_post", {
      p_post_id: postId,
      p_action: action,
      p_report_id: reportId || null,
      p_note: note || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, post: data });
  }

  const validStatuses = new Set(["reviewing", "resolved", "dismissed"]);
  if (!reportId || !validStatuses.has(body.status)) {
    return NextResponse.json({ error: "Invalid moderation update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("moderation_reports")
    .update({
      status: body.status,
      resolution_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.status !== "reviewing") {
    const actionResult = await supabase.from("moderation_actions").insert({
      report_id: data.id,
      moderator_id: user.id,
      action_type: body.status === "dismissed" ? "dismiss" : "resolve",
      target_type: data.target_type,
      target_id: data.target_id,
      note: note || null,
    });
    if (actionResult.error) return NextResponse.json({ error: actionResult.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, report: data });
}
