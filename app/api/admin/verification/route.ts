import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const REVIEW_TYPES = new Set([
  "coach",
  "educator",
  "counselor",
  "district",
  "recruiting",
  "admissions",
  "employer",
  "brand-partner",
  "community-partner",
  "athlete-abroad",
  "athlete-evidence",
]);

const DECISIONS = new Set(["under_review", "approved", "rejected"]);

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.rpc("get_verification_review_queue");
  if (error) {
    const status = error.code === "42501" ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ requests: data || [] });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const requestType = String(body.requestType || "");
  const requestId = String(body.requestId || "");
  const decision = String(body.decision || "");
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 4000) : null;

  if (!REVIEW_TYPES.has(requestType) || !requestId || !DECISIONS.has(decision)) {
    return NextResponse.json({ error: "Invalid verification review request." }, { status: 400 });
  }

  if ((decision === "approved" || decision === "rejected") && !notes) {
    return NextResponse.json({ error: "A decision reason is required to approve or reject verification." }, { status: 400 });
  }

  if (requestType === "brand-partner" && decision === "approved") {
    const queue = await supabase.rpc("get_verification_review_queue");
    if (queue.error) return NextResponse.json({ error: "Verification reviewer access required." }, { status: 403 });
    const rows = (queue.data ?? []) as Array<{ request_type: string; request_id: string; subject_user_id: string }>;
    const reviewable = rows.find(row => row.request_type === "brand-partner" && row.request_id === requestId);
    if (!reviewable) return NextResponse.json({ error: "Brand Partner verification request not reviewable." }, { status: 404 });
    const result = await supabase.rpc("get_brand_verification_documents", { requested_request_id: requestId, requested_archived: false, requested_offset: 0 });
    if (result.error) return NextResponse.json({ error: "Business evidence could not be checked." }, { status: 503 });
    const hasDocument = (result.data ?? []).length > 0;
    if (!hasDocument) return NextResponse.json({ error: "A company letterhead document or business card is required before approval." }, { status: 422 });
  }

  const { data, error } = await supabase.rpc("review_verification_request", {
    requested_type: requestType,
    requested_id: requestId,
    requested_decision: decision,
    requested_notes: notes || null,
  });

  if (error) {
    const status = error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ review: data });
}
