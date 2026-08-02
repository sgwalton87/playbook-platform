import { NextRequest, NextResponse } from "next/server";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const scholarId = request.nextUrl.searchParams.get("scholarId");
  if (!scholarId) return NextResponse.json({ error: "Scholar is required." }, { status: 422 });
  const authorization = await resolveServerAuthorization({ scholarId, permission: "view_progress" });
  if (!authorization.authorized) return NextResponse.json({ error: "Authorized Scholar context required." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("role_action_handoffs").select("*").eq("scholar_id", authorization.scholarId).order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ actions: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!body.scholarId || !body.assignedTo || !String(body.title || "").trim()) return NextResponse.json({ error: "Scholar, assignee, and title are required." }, { status: 422 });
  const { data, error } = await supabase.rpc("create_role_action_handoff", {
    p_scholar_id: body.scholarId,
    p_assigned_to: body.assignedTo,
    p_action_type: body.actionType || "intervention",
    p_title: String(body.title).trim(),
    p_detail: body.detail || null,
    p_source_type: body.sourceType || "support_network",
    p_source_id: body.sourceId || null,
    p_due_at: body.dueAt || null,
  });
  return error ? NextResponse.json({ error: "Action creation was not authorized." }, { status: 403 }) : NextResponse.json({ ok: true, action: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  const status = body.status === "complete" ? "completed" : body.status;
  if (!body.id || !["accepted", "in_progress", "completed", "declined"].includes(status)) return NextResponse.json({ error: "Action and valid status are required." }, { status: 422 });
  const { data, error } = await supabase.rpc("update_role_action_handoff", { p_handoff_id: body.id, p_status: status });
  return error ? NextResponse.json({ error: "Only the assigned participant can update this action." }, { status: 403 }) : NextResponse.json({ ok: true, action: data });
}
