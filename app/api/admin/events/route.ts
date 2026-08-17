import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const EVENT_TYPES = new Set(["workshop", "lab", "civic", "social", "virtual", "course", "networking", "community", "summit"]);

function rpcErrorStatus(error: { code?: string; message: string }) {
  return error.code === "42501" || error.message.toLowerCase().includes("operator authority") ? 403 : 400;
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const result = await supabase.rpc("get_community_event_operations");
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: rpcErrorStatus(result.error) });
    return NextResponse.json({ events: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Event operations could not be loaded." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as {
      title?: unknown;
      description?: unknown;
      eventType?: unknown;
      pillar?: unknown;
      startsAt?: unknown;
      endsAt?: unknown;
      timezone?: unknown;
      location?: unknown;
      virtualUrl?: unknown;
      capacity?: unknown;
      xpReward?: unknown;
      coinReward?: unknown;
      publishNow?: unknown;
    };

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const eventType = String(body.eventType ?? "").trim();
    const startsAt = String(body.startsAt ?? "").trim();
    const endsAt = String(body.endsAt ?? "").trim();
    const capacity = body.capacity === null || body.capacity === undefined || String(body.capacity).trim() === "" ? null : Number(body.capacity);
    const xpReward = Number(body.xpReward ?? 0);
    const coinReward = Number(body.coinReward ?? 0);

    if (title.length < 3 || description.length < 10 || !EVENT_TYPES.has(eventType) || !startsAt || !endsAt) {
      return NextResponse.json({ error: "Title, description, supported event type, start, and end are required." }, { status: 400 });
    }
    if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
      return NextResponse.json({ error: "Capacity must be a positive whole number when provided." }, { status: 400 });
    }
    if (!Number.isFinite(xpReward) || !Number.isFinite(coinReward) || xpReward < 0 || coinReward < 0) {
      return NextResponse.json({ error: "Event rewards must be non-negative numbers." }, { status: 400 });
    }

    const result = await supabase.rpc("create_community_event", {
      event_title: title,
      event_description: description,
      event_type_input: eventType,
      pillar_input: String(body.pillar ?? "Community").trim() || "Community",
      starts_at_input: startsAt,
      ends_at_input: endsAt,
      timezone_input: String(body.timezone ?? "America/Los_Angeles").trim() || "America/Los_Angeles",
      location_input: String(body.location ?? "").trim() || null,
      virtual_url_input: String(body.virtualUrl ?? "").trim() || null,
      capacity_input: capacity,
      xp_reward_input: Math.floor(xpReward),
      coin_reward_input: Math.floor(coinReward),
      publish_now: body.publishNow !== false,
    });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: rpcErrorStatus(result.error) });
    return NextResponse.json({ eventId: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Event could not be created." }, { status: 400 });
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
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: rpcErrorStatus(result.error) });
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
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: rpcErrorStatus(result.error) });
    return NextResponse.json({ checkIn: result.data?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Check-in token could not be created." }, { status: 400 });
  }
}
