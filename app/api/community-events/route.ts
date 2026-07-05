import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  const { data, error } = await admin()
    .from("community_events")
    .select("*, community_event_rsvps(*)")
    .order("starts_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ events: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await admin()
    .from("community_events")
    .insert({
      created_by: body.userId,
      title: body.title,
      description: body.description || null,
      event_type: body.eventType || "community",
      location: body.location || null,
      starts_at: body.startsAt || null,
      ends_at: body.endsAt || null,
      visibility: "public",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, event: data });
}
