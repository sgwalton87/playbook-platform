import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const result = await supabase.rpc("get_community_event_operations");
    if (result.error) {
      const forbidden = result.error.code === "42501" || result.error.message.toLowerCase().includes("operator authority");
      return NextResponse.json({ error: result.error.message }, { status: forbidden ? 403 : 400 });
    }
    return NextResponse.json({ events: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Event operations could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as {
      eventId?: unknown;
      replayUrl?: unknown;
      networkingEnabled?: unknown;
      checkInEnabled?: unknown;
    };
    const eventId = String(body.eventId ?? "").trim();
    if (!eventId) return NextResponse.json({ error: "Event ID is required." }, { status: 400 });

    const result = await supabase.rpc("configure_community_event_experience", {
      requested_event_id: eventId,
      requested_replay_url: String(body.replayUrl ?? "").trim() || null,
      requested_networking_enabled: body.networkingEnabled === true,
      requested_check_in_enabled: body.checkInEnabled === true,
    });
    if (result.error) {
      const forbidden = result.error.code === "42501" || result.error.message.toLowerCase().includes("operator authority");
      return NextResponse.json({ error: result.error.message }, { status: forbidden ? 403 : 400 });
    }
    return NextResponse.json({ event: result.data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Event experience could not be configured." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { eventId?: unknown; validFrom?: unknown; validUntil?: unknown };
    const eventId = String(body.eventId ?? "").trim();
    const validFrom = String(body.validFrom ?? "").trim();
    const validUntil = String(body.validUntil ?? "").trim();
    if (!eventId || !validFrom || !validUntil) {
      return NextResponse.json({ error: "Event and check-in validity window are required." }, { status: 400 });
    }

    const result = await supabase.rpc("create_community_event_checkin_code", {
      requested_event_id: eventId,
      requested_valid_from: validFrom,
      requested_valid_until: validUntil,
    });
    if (result.error) {
      const forbidden = result.error.code === "42501" || result.error.message.toLowerCase().includes("operator authority");
      return NextResponse.json({ error: result.error.message }, { status: forbidden ? 403 : 400 });
    }
    return NextResponse.json({ checkIn: result.data?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Check-in token could not be created." }, { status: 400 });
  }
}
