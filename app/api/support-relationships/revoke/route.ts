import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

function statusForError(message: string) {
  if (message.includes("Authentication required")) return 401;
  if (message.includes("Only the Scholar or connected supporter")) return 403;
  if (message.includes("not found")) return 404;
  if (message.includes("already")) return 409;
  return 400;
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json() as { relationshipId?: unknown; reason?: unknown };
    const relationshipId = String(body.relationshipId ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    if (!relationshipId) {
      return NextResponse.json({ error: "Support relationship ID is required." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("revoke_support_relationship", {
      relationship_id: relationshipId,
      reason: reason || null,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: statusForError(error.message) });
    }

    const revoked = Array.isArray(data) ? data[0] : data;
    if (!revoked) {
      return NextResponse.json({ error: "Revocation returned no relationship." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      relationship: revoked,
      message: "Support relationship removed. All relationship permissions are now revoked while audit history is preserved.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Support relationship could not be revoked." },
      { status: 400 }
    );
  }
}
