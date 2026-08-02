import { NextRequest, NextResponse } from "next/server";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const authorization = await resolveServerAuthorization({ permission: "verify_evidence" });
  if (!authorization.authorized) return NextResponse.json({ error: "Verification relationship required." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("evidence_verification_requests").select("id,evidence_id,scholar_id,status,request_note,requested_at").eq("scholar_id", authorization.scholarId).in("status", ["pending", "in_review"]).order("requested_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ requests: data || [], scholarId: authorization.scholarId });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json()) as { evidenceId?: string; note?: string };
  if (!body.evidenceId) return NextResponse.json({ error: "Evidence is required." }, { status: 422 });
  const { data, error } = await supabase.rpc("request_evidence_verification", { p_evidence_id: body.evidenceId, p_note: body.note || null });
  if (error) return NextResponse.json({ error: error.code === "23505" ? "An open verification request already exists." : error.message }, { status: error.code === "23505" ? 409 : 400 });
  return NextResponse.json({ ok: true, request: data }, { status: 201 });
}
