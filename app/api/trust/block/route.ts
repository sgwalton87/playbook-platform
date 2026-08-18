import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

type BlockBody = { blockedUserId?: unknown };
type BlockStateRow = {
  conversation_id: string;
  peer_id: string;
  blocked_by_me: boolean;
  blocked_by_peer: boolean;
  messaging_blocked: boolean;
};

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

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const conversationIds = [...new Set(
      request.nextUrl.searchParams.getAll("conversationId")
        .flatMap(value => value.split(","))
        .map(value => value.trim())
        .filter(Boolean),
    )];
    if (!conversationIds.length || conversationIds.length > 100) {
      return NextResponse.json({ error: "One to 100 conversation identifiers are required." }, { status: 400 });
    }

    const projection = await supabase.rpc("get_governed_conversation_block_states", {
      requested_conversation_ids: conversationIds,
    });
    if (projection.error) throw new Error(projection.error.message);

    const states = Object.fromEntries(((projection.data ?? []) as BlockStateRow[]).map(row => [row.conversation_id, {
      peerId: row.peer_id,
      blockedByMe: Boolean(row.blocked_by_me),
      blockedByPeer: Boolean(row.blocked_by_peer),
      messagingBlocked: Boolean(row.messaging_blocked),
    }]));
    return NextResponse.json({ states });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Block state could not be loaded.",
    }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return setBlock(request, true);
}

export async function DELETE(request: NextRequest) {
  return setBlock(request, false);
}
