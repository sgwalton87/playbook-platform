import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

function statusForValidationError(message: string) {
  if (message.includes("Authentication required")) return 401;
  if (message.includes("cannot validate their own")) return 403;
  if (message.includes("Only active members")) return 403;
  if (message.includes("not found")) return 404;
  if (message.includes("not pending") || message.includes("duplicate key")) return 409;
  return 400;
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const body = await req.json() as { validationRequestId?: unknown };
    const validationRequestId = String(body.validationRequestId ?? "").trim();
    if (!validationRequestId) {
      return NextResponse.json({ error: "Mentor validation request ID is required." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("approve_mentor_validation", {
      validation_request_id: validationRequestId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: statusForValidationError(error.message) });
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result) return NextResponse.json({ error: "Mentor validation returned no result." }, { status: 500 });

    return NextResponse.json({
      ok: true,
      validation: {
        requestId: result.request_id,
        approvalCount: Number(result.approval_count ?? 0),
        privilegedValidator: Boolean(result.privileged_validator),
        thresholdMet: Boolean(result.threshold_met),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to validate mentor." }, { status: 500 });
  }
}
