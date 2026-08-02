import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireIdempotencyKey, requireSameOrigin } from "@/lib/scholar-athlete/api";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, allowed: false };
  const { data } = await supabase.rpc("is_platform_admin", { p_user: auth.user.id });
  return { supabase, allowed: data === true };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export async function GET() {
  const boundary = await requireAdmin();
  if (!boundary.allowed) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { data, error } = await boundary.supabase.from("nil_deals")
    .select("id,scholar_id,brand_name,opportunity_title,opportunity_type,stage,contract_status,disclosure_status,compliance_status,jurisdiction,institution_name,agreement_reference,source_name,source_url,created_at,updated_at")
    .in("compliance_status", ["submitted", "under_review", "changes_required"])
    .order("updated_at", { ascending: true })
    .limit(100);
  return error
    ? NextResponse.json({ error: "The NIL compliance queue is unavailable." }, { status: 400 })
    : NextResponse.json({ deals: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin.response;
  const boundary = await requireAdmin();
  if (!boundary.allowed) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const idempotency = requireIdempotencyKey(request);
  if (!idempotency.ok) return idempotency.response;
  const body = record(await request.json().catch(() => null));
  const dealId = typeof body?.dealId === "string" ? body.dealId.trim() : "";
  const decision = typeof body?.decision === "string" ? body.decision : "";
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (!dealId || !["approved", "changes_required", "rejected"].includes(decision) || reason.length < 3 || reason.length > 2000) {
    return NextResponse.json({ error: "Deal, valid decision, and documented reason are required." }, { status: 422 });
  }
  const { data, error } = await boundary.supabase.rpc("review_nil_compliance", {
    p_deal_id: dealId,
    p_decision: decision,
    p_reason: reason,
    p_idempotency_key: idempotency.value,
  });
  return error
    ? NextResponse.json({ error: "The compliance decision was not authorized or valid." }, { status: 403 })
    : NextResponse.json(data);
}
