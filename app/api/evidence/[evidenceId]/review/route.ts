import { NextRequest, NextResponse } from "next/server";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = await context.params;
  const body = (await request.json()) as { requestId?: string; decision?: string; reason?: string };
  if (!body.requestId || (body.decision !== "verified" && body.decision !== "rejected") || !body.reason?.trim()) {
    return NextResponse.json({ ok: false, error: "Request, verified/rejected decision, and reason are required." }, { status: 422 });
  }
  const supabase = await createServerSupabaseClient();
  const { data: verificationRequest } = await supabase.from("evidence_verification_requests").select("id,evidence_id,scholar_id").eq("id", body.requestId).eq("evidence_id", evidenceId).maybeSingle();
  if (!verificationRequest) return NextResponse.json({ ok: false, error: "Verification request not found." }, { status: 404 });
  const authorization = await resolveServerAuthorization({ scholarId: verificationRequest.scholar_id, permission: "verify_evidence" });
  if (!authorization.authorized) return NextResponse.json({ ok: false, error: "Evidence review permission required." }, { status: 403 });
  const { data, error } = await supabase.rpc("review_verification_request", { p_request_id: body.requestId, p_decision: body.decision, p_reason: body.reason.trim() });
  if (error) return NextResponse.json({ ok: false, error: "Verification request could not be reviewed." }, { status: 409 });
  return NextResponse.json({ ok: true, ...data });
}
