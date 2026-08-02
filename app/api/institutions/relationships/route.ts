import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const TYPES = ["school", "district", "university"] as const;
const INSTITUTION_ROLES: Record<(typeof TYPES)[number], string[]> = { school: ["educator", "coach"], district: ["district"], university: ["college-coach", "college-admissions"] };

export async function GET() {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("institutional_relationships").select("*").or(`scholar_id.eq.${auth.user.id},institution_member_id.eq.${auth.user.id}`).order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ relationships: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!TYPES.includes(body.institutionType) || !body.memberId || !String(body.institutionName || "").trim() || !String(body.purpose || "").trim()) return NextResponse.json({ error: "Institution type, member, name, and purpose are required." }, { status: 422 });
  const admin = createAdminSupabaseClient();
  const { data: member } = await admin.from("profiles").select("id,role,profile_mode").eq("id", body.memberId).maybeSingle();
  const memberRole = member?.profile_mode || member?.role;
  if (!member || !INSTITUTION_ROLES[body.institutionType as keyof typeof INSTITUTION_ROLES].includes(memberRole)) return NextResponse.json({ error: "Institution member role does not match this relationship type." }, { status: 422 });
  const permissions = body.institutionType === "school" ? ["view_progress", "view_evidence", "verify_evidence", "recommend_actions"] : body.institutionType === "district" ? ["view_evidence", "verify_evidence", "view_cohort", "view_equity_metrics"] : ["view_verified_record", "recommend_actions"];
  const { data, error } = await supabase.from("institutional_relationships").insert({ scholar_id: auth.user.id, institution_member_id: member.id, institution_type: body.institutionType, institution_name: String(body.institutionName).trim(), purpose: String(body.purpose).trim(), permissions, invited_by: auth.user.id, expires_at: body.expiresAt || null }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true, relationship: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json();
  if (!body.id || !["active", "declined", "revoked"].includes(body.status)) return NextResponse.json({ error: "Relationship and valid state are required." }, { status: 422 });
  const { data, error } = await supabase.rpc("respond_institutional_relationship", { p_relationship_id: body.id, p_status: body.status });
  return error ? NextResponse.json({ error: "The requested relationship transition is not authorized." }, { status: 403 }) : NextResponse.json({ ok: true, relationship: data });
}
