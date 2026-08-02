import { NextRequest, NextResponse } from "next/server";
import { sanitizeLaunchAnalytics } from "@/lib/launch-controls";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const payload = sanitizeLaunchAnalytics(await request.json());
  if (!payload) return NextResponse.json({ error: "A governed analytics event is required." }, { status: 422 });
  const { data, error } = await supabase.rpc("record_launch_analytics_event", { p_event_name: payload.event, p_properties: payload.properties });
  if (error) return NextResponse.json({ error: "Analytics consent is required." }, { status: 403 });
  return NextResponse.json({ ok: true, eventId: data }, { status: 202 });
}
