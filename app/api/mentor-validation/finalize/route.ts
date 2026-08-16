import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

function statusForFinalizeError(message: string) {
  if (message.includes("Authentication required")) return 401;
  if (message.includes("Only the invited mentor")) return 403;
  if (message.includes("threshold has not been met")) return 403;
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

    const { data, error } = await supabase.rpc("finalize_mentor_validation", {
      validation_request_id: validationRequestId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: statusForFinalizeError(error.message) });
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result) return NextResponse.json({ error: "Mentor activation returned no result." }, { status: 500 });

    return NextResponse.json({
      ok: true,
      destination: "/mentor-os",
      validation: {
        requestId: result.request_id,
        scholarId: result.scholar_id,
        mentorUserId: result.mentor_user_id,
        status: result.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to activate mentor." }, { status: 500 });
  }
}
