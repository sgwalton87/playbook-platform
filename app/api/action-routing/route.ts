import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("role_action_handoffs").select("*").or(`scholar_id.eq.${auth.user.id},created_by.eq.${auth.user.id},assigned_to.eq.${auth.user.id}`).order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ handoffs: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!body.scholarId || !body.assignedTo || !body.actionType || !String(body.title || "").trim() || !body.sourceType) return NextResponse.json({ error: "Scholar, assignee, action type, title, and source are required." }, { status: 422 });
  const { data, error } = await supabase.rpc("create_role_action_handoff", { p_scholar_id: body.scholarId, p_assigned_to: body.assignedTo, p_action_type: body.actionType, p_title: String(body.title).trim(), p_detail: body.detail || null, p_source_type: body.sourceType, p_source_id: body.sourceId || null, p_due_at: body.dueAt || null });
  return error ? NextResponse.json({ error: "Action handoff was not authorized." }, { status: 403 }) : NextResponse.json({ ok: true, handoff: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!body.handoffId || !["accepted", "in_progress", "completed", "declined"].includes(body.status)) return NextResponse.json({ error: "Handoff and valid state are required." }, { status: 422 });
  const { data, error } = await supabase.rpc("update_role_action_handoff", { p_handoff_id: body.handoffId, p_status: body.status });
  return error ? NextResponse.json({ error: "Only the assigned participant can update an open handoff." }, { status: 403 }) : NextResponse.json({ ok: true, handoff: data });
}
