import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const result = await supabase.rpc("get_community_events");
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, events: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Events could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { eventId?: unknown; status?: unknown };
    const eventId = String(body.eventId ?? "").trim();
    const status = String(body.status ?? "").trim();
    if (!eventId || !["going", "interested", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Valid event and RSVP status are required." }, { status: 400 });
    }
    const result = await supabase.rpc("rsvp_community_event", { requested_event_id: eventId, requested_status: status });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, rsvp: result.data?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "RSVP could not be updated." }, { status: 400 });
  }
}
