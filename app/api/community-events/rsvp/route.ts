import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { hasExistingReward } from "@/lib/trust/rewardGuard";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (!body.eventId) {
    return NextResponse.json(
      { error: "Missing event." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("community_event_rsvps")
    .upsert(
      {
        event_id: body.eventId,
        user_id: user.id,
        status: body.status || "going",
      },
      {
        onConflict: "event_id,user_id",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  const rewarded = await hasExistingReward(supabase, {
    scholarId: user.id,
    eventType: "event.rsvp",
    sourceId: body.eventId,
  });

  if (!rewarded) {
    await supabase
      .from("coin_ledger")
      .insert({
        scholar_id: user.id,
        event_type: "event.rsvp",
        source_id: body.eventId,
        coins: 15,
        xp: 20,
        reason: "RSVP'd to a community event",
      });
  }

  return NextResponse.json({
    ok: true,
    rsvp: data,
    rewardIssued: !rewarded,
  });
}
