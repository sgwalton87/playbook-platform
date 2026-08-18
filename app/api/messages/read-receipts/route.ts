import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

type ReceiptProjectionRow = {
  message_id: string;
  read_count: number | string | null;
};

async function receiptPayload(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  conversationId: string,
) {
  const receipts = await supabase.rpc("get_governed_message_read_receipts", {
    p_conversation_id: conversationId,
  });
  if (receipts.error) throw new Error(receipts.error.message);
  return {
    currentUserId: userId,
    receipts: Object.fromEntries((receipts.data ?? []).map((item: ReceiptProjectionRow) => [
      String(item.message_id),
      Number(item.read_count ?? 0),
    ])),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const conversationId = request.nextUrl.searchParams.get("conversationId") ?? "";
    if (!conversationId) return NextResponse.json({ error: "Conversation identifier is required." }, { status: 400 });
    return NextResponse.json(await receiptPayload(supabase, user.id, conversationId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Read receipts could not be loaded." }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { conversationId?: unknown };
    const conversationId = String(body.conversationId ?? "");
    if (!conversationId) return NextResponse.json({ error: "Conversation identifier is required." }, { status: 400 });

    const marked = await supabase.rpc("mark_governed_conversation_read", {
      p_conversation_id: conversationId,
    });
    if (marked.error) throw new Error(marked.error.message);

    return NextResponse.json({
      ...(await receiptPayload(supabase, user.id, conversationId)),
      readAt: marked.data,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Conversation could not be marked read." }, { status: 403 });
  }
}
