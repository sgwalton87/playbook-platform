import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { data, error } = await supabase
      .from("community_events")
      .select("id,created_by,title,description,event_type,location,starts_at,ends_at,visibility,created_at,community_event_rsvps(id,user_id,status,created_at)")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);

    return NextResponse.json({ events: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load community events." }, { status: 400 });
  }
}

/**
 * Event publication is intentionally fail-closed until a canonical publisher
 * role/permission contract exists. Browsing and RSVP remain shared platform
 * capabilities; publishing is an authority-bearing action and must not be
 * inferred from a request-body userId.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Community event publishing requires a governed publisher authority contract.",
      activationState: "publisher_authority_required",
    },
    { status: 403 }
  );
}
