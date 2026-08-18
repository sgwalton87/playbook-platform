import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

type BlockBody = { blockedUserId?: unknown };

async function requestedUserId(request: NextRequest, actorId: string) {
  const body = await request.json() as BlockBody;
  const blockedUserId = String(body.blockedUserId ?? "").trim();
  if (!blockedUserId || blockedUserId === actorId) {
    throw new Error("A different Playbook user is required.");
  }
  return blockedUserId;
}

async function setBlock(request: NextRequest, blocked: boolean) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const blockedUserId = await requestedUserId(request, user.id);
    const result = await supabase.rpc("set_user_block", {
      requested_user_id: blockedUserId,
      requested_blocked: blocked,
    });
    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({ ok: true, blocked: Boolean(result.data), blockedUserId });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Block setting could not be updated.",
    }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return setBlock(request, true);
}

export async function DELETE(request: NextRequest) {
  return setBlock(request, false);
}
