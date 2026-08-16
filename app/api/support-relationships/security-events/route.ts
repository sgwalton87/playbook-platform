import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

const MAX_EVENTS = 100;

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const requestedLimit = Number(req.nextUrl.searchParams.get("limit") || "50");
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(MAX_EVENTS, Math.trunc(requestedLimit)))
      : 50;

    const result = await supabase
      .from("relationship_security_events")
      .select("id,relationship_id,scholar_id,supporter_id,relationship,event_type,actor_id,previous_status,new_status,previous_permissions,new_permissions,occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (result.error) throw new Error(result.error.message);

    const events = result.data ?? [];
    const counts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      ok: true,
      events,
      metrics: {
        returned: events.length,
        byEventType: counts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Relationship security history could not be loaded." },
      { status: 400 }
    );
  }
}
