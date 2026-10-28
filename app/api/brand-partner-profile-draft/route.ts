import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requirePlaybookRole } from "@/lib/roles/registry";

const DRAFT_KEY = "brand_organization_draft";
type Draft = { summary: string; website: string; logo: string; location: string; focus: string };
function clean(value: unknown, max: number): string { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function normalize(data: Record<string, unknown>): Draft {
  return { summary: clean(data.summary, 2000), website: clean(data.website, 500),
    logo: clean(data.logo, 500), location: clean(data.location, 240), focus: clean(data.focus, 1500) };
}
async function getOwnProfile() {
  const { supabase, user } = await requireUser();
  if (!user) return { error: NextResponse.json({ error: "Login required" }, { status: 401 }) };
  const result = await supabase.from("profiles").select("role,profile_mode,onboarding_data")
    .eq("id", user.id).maybeSingle();
  if (result.error || !result.data) return { error: NextResponse.json({ error: "Profile unavailable" }, { status: 404 }) };
  try {
    if (requirePlaybookRole(result.data.profile_mode ?? result.data.role) !== "brand-partner")
      return { error: NextResponse.json({ error: "Brand Partner role required" }, { status: 403 }) };
  } catch { return { error: NextResponse.json({ error: "Role verification failed" }, { status: 403 }) }; }
  return { supabase, user, profile: result.data };
}
export async function GET() {
  try {
    const ctx = await getOwnProfile();
    if (ctx.error) return ctx.error;
    const data = (ctx.profile!.onboarding_data ?? {}) as Record<string, unknown>;
    const draft = data[DRAFT_KEY] && typeof data[DRAFT_KEY] === "object" ? data[DRAFT_KEY] as Record<string, unknown> : {};
    return NextResponse.json({ draft: normalize(draft), savedAt: typeof draft.savedAt === "string" ? draft.savedAt : null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Draft could not be loaded" }, { status: 500 }); }
}
export async function PUT(request: Request) {
  try {
    const ctx = await getOwnProfile();
    if (ctx.error) return ctx.error;
    const body = await request.json() as Record<string, unknown>;
    const draft = normalize(body);
    for (const url of [draft.website, draft.logo]) {
      if (url && !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "URLs must begin with https:// or http://" }, { status: 400 });
    }
    const existing = (ctx.profile!.onboarding_data ?? {}) as Record<string, unknown>;
    const savedAt = new Date().toISOString();
    const updated = await ctx.supabase!.from("profiles").update({
      onboarding_data: { ...existing, [DRAFT_KEY]: { ...draft, savedAt } },
    }).eq("id", ctx.user!.id).select("id,onboarding_data").single();
    if (updated.error || !updated.data) return NextResponse.json({ error: "Draft was not saved" }, { status: 500 });
    const stored = (updated.data.onboarding_data as Record<string, unknown>)[DRAFT_KEY] as Record<string, unknown> | undefined;
    if (!stored || stored.savedAt !== savedAt) return NextResponse.json({ error: "Draft confirmation failed" }, { status: 500 });
    return NextResponse.json({ saved: true, savedAt, draft });
  } catch { return NextResponse.json({ error: "Draft was not saved" }, { status: 500 }); }
}
