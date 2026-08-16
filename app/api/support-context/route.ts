import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const [available, active] = await Promise.all([
      supabase.rpc("get_available_support_scholar_contexts"),
      supabase.rpc("get_active_support_scholar_context"),
    ]);
    if (available.error) throw new Error(available.error.message);
    if (active.error) throw new Error(active.error.message);

    return NextResponse.json({
      available: available.data ?? [],
      active: active.data?.[0] ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Support context could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { relationshipId?: unknown };
    const relationshipId = body.relationshipId == null || body.relationshipId === "" ? null : String(body.relationshipId);
    const result = await supabase.rpc("set_active_support_scholar_context", { requested_relationship_id: relationshipId });
    if (result.error) throw new Error(result.error.message);
    const active = await supabase.rpc("get_active_support_scholar_context");
    if (active.error) throw new Error(active.error.message);
    return NextResponse.json({ ok: true, active: active.data?.[0] ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Active Scholar context could not be updated." }, { status: 400 });
  }
}
