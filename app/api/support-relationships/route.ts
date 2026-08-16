import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const result = await supabase
      .from("support_relationships")
      .select("id,scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,status,source_invitation_id,created_at,ended_at,ended_by,end_reason")
      .or(`scholar_id.eq.${user.id},supporter_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({
      ok: true,
      userId: user.id,
      relationships: (result.data ?? []).map((relationship) => ({
        ...relationship,
        perspective: relationship.scholar_id === user.id ? "scholar" : "supporter",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Support relationships could not be loaded." },
      { status: 400 }
    );
  }
}
