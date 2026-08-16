import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const result = await supabase.rpc("get_mentor_circles");
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, circles: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Mentorship circles could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { circleId?: unknown; action?: unknown };
    const circleId = String(body.circleId ?? "").trim();
    const action = String(body.action ?? "join").trim();
    if (!circleId || !["join", "leave"].includes(action)) {
      return NextResponse.json({ error: "Valid circle and action are required." }, { status: 400 });
    }
    const result = await supabase.rpc("join_mentor_circle", { requested_circle_id: circleId, requested_action: action });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, membership: result.data?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Circle membership could not be updated." }, { status: 400 });
  }
}
