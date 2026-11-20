import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

/**
 * DYN-003 first gate: resolve a real, authenticated recommendation request.
 * Supabase recommender_requests RLS authorizes the onboarded Scholar-owner or
 * the recommender whose verified JWT email matches; never service-role read.
 * Decisions are deliberately NOT supported here until a separate governed
 * letter version and consent/decision command is certified.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ requestId: string }> },
) {
  try {
    const { requestId } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
      return NextResponse.json({ error: "Recommendation request not found." }, { status: 404 });
    }
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { data, error } = await supabase
      .from("recommender_requests")
      .select("id,scholar_id,scholar_name,recommender_name,recommender_role,opportunity_name,status,letter_text,created_at,approved_at")
      .eq("id", requestId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Recommendation request not found." }, { status: 404 });

    return NextResponse.json({ ok: true, request: data }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Recommendation request could not be loaded." }, { status: 500 });
  }
}
