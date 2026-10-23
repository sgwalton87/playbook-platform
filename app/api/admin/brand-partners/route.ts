import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user || !user.email_confirmed_at) return NextResponse.json({ error: "Verified authentication required." }, { status: 401 });
  const { data, error } = await supabase.rpc("list_brand_partner_review_queue");
  if (error) return NextResponse.json({ error: "Reviewer authorization required or review service unavailable." }, { status: 403 });
  return NextResponse.json({ requests: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user || !user.email_confirmed_at) return NextResponse.json({ error: "Verified authentication required." }, { status: 401 });
  const payload = await request.json().catch(() => null) as { requestId?: unknown; scope?: unknown; decision?: unknown; reason?: unknown } | null;
  if (!payload || typeof payload.requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(payload.requestId)
    || !["organization","campaign","compliance"].includes(String(payload.scope))
    || !["approve","reject"].includes(String(payload.decision))
    || typeof payload.reason !== "string" || payload.reason.trim().length < 8 || payload.reason.length > 2000) {
    return NextResponse.json({ error: "Valid request, scope, decision and reason are required." }, { status: 400 });
  }
  const { error } = await supabase.rpc("decide_brand_partner_review", {
    p_request_id: payload.requestId, p_scope: payload.scope,
    p_decision: payload.decision, p_reason: payload.reason.trim(),
  });
  if (error) return NextResponse.json({ error: "Review was not completed. Check authorization, request status and approval sequence." }, { status: 403 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
