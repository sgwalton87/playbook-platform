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
