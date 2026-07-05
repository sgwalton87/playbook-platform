import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await admin()
    .from("community_event_rsvps")
    .upsert({
      event_id: body.eventId,
      user_id: body.userId,
      status: body.status || "going",
    }, { onConflict: "event_id,user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin().from("coin_ledger").insert({
    scholar_id: body.userId,
    event_type: "event.rsvp",
    source_id: body.eventId,
    coins: 15,
    xp: 20,
    reason: "RSVP'd to a community event",
  });

  return NextResponse.json({ ok: true, rsvp: data });
}
