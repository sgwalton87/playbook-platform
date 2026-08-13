import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("community_events")
    .select("*, community_event_rsvps(*)")
    .order("starts_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ events: data || [] });
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { data, error } = await supabase
    .from("community_events")
    .insert({
      created_by: user.id,
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
