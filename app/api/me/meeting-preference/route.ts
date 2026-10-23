import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status });
export async function GET() {
  const { user, supabase } = await requireUser();
  if (!user) return errorResponse("Sign in required.", 401);
  const { data, error } = await supabase.from("member_meeting_preferences")
    .select("provider,meeting_url,label,updated_at").eq("owner_id", user.id).maybeSingle();
  if (error) return errorResponse("Meeting preference could not be loaded.", 500);
  return NextResponse.json({ preference: data ?? null }, { headers: { "Cache-Control": "no-store" } });
}
export async function PUT(request: NextRequest) {
  const { user, supabase } = await requireUser();
  if (!user || !user.email_confirmed_at) return errorResponse("Verified sign-in required.", 401);
  const input = await request.json().catch(() => null) as { provider?: unknown; meetingUrl?: unknown; label?: unknown } | null;
  if (!input || typeof input.meetingUrl !== "string" || typeof input.label !== "string" || typeof input.provider !== "string"
      || input.meetingUrl.length > 1500 || input.label.length > 100 || !["zoom","meet","teams","other"].includes(input.provider)) return errorResponse("Enter a valid meeting preference.",400);
  let url: URL;
  try { url = new URL(input.meetingUrl.trim()); } catch { return errorResponse("Enter a valid HTTPS meeting URL.",400); }
  if (url.protocol !== "https:" || url.username || url.password || !url.hostname || !input.label.trim()) return errorResponse("Enter a valid HTTPS meeting URL and label.",400);
  const { error } = await supabase.from("member_meeting_preferences").upsert({
    owner_id: user.id, provider: input.provider, meeting_url: url.toString(), label: input.label.trim(), updated_at: new Date().toISOString()
  }, { onConflict: "owner_id" });
  if (error) return errorResponse("Meeting preference could not be saved.",500);
  return NextResponse.json({ ok: true });
}
export async function DELETE() {
  const { user, supabase } = await requireUser();
  if (!user) return errorResponse("Sign in required.",401);
  const { error } = await supabase.from("member_meeting_preferences").delete().eq("owner_id",user.id);
  if (error) return errorResponse("Meeting preference could not be deleted.",500);
  return NextResponse.json({ ok: true });
}
