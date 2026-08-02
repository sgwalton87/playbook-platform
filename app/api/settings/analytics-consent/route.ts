import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
const POLICY_VERSION = "2026-08-01";
export async function GET() {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("analytics_consents").select("status,policy_version,granted_at,withdrawn_at,updated_at").eq("user_id", auth.user.id).maybeSingle();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ consent: data ?? { status: "denied", policy_version: POLICY_VERSION } });
}
export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json(); const status = body.status === "granted" ? "granted" : body.status === "withdrawn" ? "withdrawn" : null;
  if (!status) return NextResponse.json({ error: "Explicit grant or withdrawal is required." }, { status: 422 });
  const now = new Date().toISOString();
  const { error } = await supabase.from("analytics_consents").upsert({ user_id: auth.user.id, status, policy_version: POLICY_VERSION, granted_at: status === "granted" ? now : null, withdrawn_at: status === "withdrawn" ? now : null, updated_at: now });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true, status, policyVersion: POLICY_VERSION });
}
