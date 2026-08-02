import { NextRequest, NextResponse } from "next/server";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EVENT_TYPES = [
  "intervention.assigned", "intervention.completed", "opportunity.recommended", "milestone.confirmed",
] as const;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!EVENT_TYPES.includes(body.type) || !body.scholarId) return NextResponse.json({ error: "A supported event type and Scholar are required." }, { status: 422 });
  if (body.type === "milestone.confirmed" && body.scholarId !== auth.user.id) return NextResponse.json({ error: "Only a Scholar can confirm their milestone." }, { status: 403 });
  const permission = body.type === "intervention.completed" ? "support_tasks" : body.type === "milestone.confirmed" ? "view_progress" : "recommend_actions";
  const authorization = await resolveServerAuthorization({ scholarId: body.scholarId, permission });
  if (!authorization.authorized) return NextResponse.json({ error: "Scholar relationship required." }, { status: 403 });
  const { data: profile } = await supabase.from("profiles").select("role,profile_mode").eq("id", auth.user.id).maybeSingle();
  const event = { type: body.type, scholar_id: authorization.scholarId, actor_id: auth.user.id, actor_role: profile?.profile_mode || profile?.role || "scholar", payload: { title: String(body.title || "Playbook update"), detail: String(body.detail || "Review the governed update."), sourceId: body.sourceId || null } };
  const { data, error } = await supabase.from("playbook_events").insert(event).select("id,type,scholar_id,created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, event: data }, { status: 201 });
}
