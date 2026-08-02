import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireAdministrator() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, allowed: false };
  const { data: allowed } = await supabase.rpc("is_platform_admin", { p_user: auth.user.id });
  return { supabase, allowed: allowed === true };
}

export async function GET() {
  const { supabase, allowed } = await requireAdministrator();
  if (!allowed) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { data, error } = await supabase.from("content_safety_reports")
    .select("id,reporter_id,target_type,target_id,category,detail,severity,status,assigned_to,resolution_note,created_at,updated_at")
    .in("status", ["open", "triaged", "investigating", "escalated"])
    .order("severity", { ascending: false }).order("created_at", { ascending: true });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ reports: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const { supabase, allowed } = await requireAdministrator();
  if (!allowed) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json();
  if (!body.reportId || !body.status || !String(body.reason || "").trim()) {
    return NextResponse.json({ error: "Report, decision, and reason are required." }, { status: 422 });
  }
  const { data, error } = await supabase.rpc("moderate_safety_report", {
    p_report_id: body.reportId, p_status: body.status, p_reason: String(body.reason).trim(),
  });
  return error ? NextResponse.json({ error: "The moderation decision was not authorized or valid." }, { status: 403 }) : NextResponse.json({ ok: true, decision: data });
}
