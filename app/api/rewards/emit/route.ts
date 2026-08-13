import { NextRequest, NextResponse } from "next/server";
import {
  buildCoinLedgerEntry,
  buildRewardEvent,
  getRewardValue,
  type RewardEventType,
} from "@/lib/reward-events";
import { requireUser } from "@/lib/supabase/server";

const ALLOWED_REWARD_TYPES: readonly RewardEventType[] = [
  "course.completed",
  "module.completed",
  "invitation.sent",
  "invitation.accepted",
  "shared_action.completed",
  "goal.completed",
  "evidence.verified",
  "message.sent",
  "milestone.completed",
  "portfolio.shared",
  "recommendation.approved",
  "application.ready",
  "athlete.eligibility_progress",
  "store.redemption",
];

function isRewardEventType(value: unknown): value is RewardEventType {
  return (
    typeof value === "string" &&
    (ALLOWED_REWARD_TYPES as readonly string[]).includes(value)
  );
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const scholarId = body.scholarId || user.id;

    if (scholarId !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (!isRewardEventType(body.eventType) || !getRewardValue(body.eventType)) {
      return NextResponse.json({ error: "Invalid reward event type." }, { status: 400 });
    }

    const eventType = body.eventType as RewardEventType;

    const event = buildRewardEvent({
      scholarId,
      eventType,
      sourceId: body.sourceId,
      payload: body.payload || {},
    });

    const { data: savedEvent, error: eventError } = await supabase
      .from("reward_events")
      .insert(event)
      .select()
      .single();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 400 });
    }

    const ledgerEntry = buildCoinLedgerEntry({
      scholarId,
      eventType,
      sourceId: body.sourceId,
    });

    const { data: savedLedger, error: ledgerError } = await supabase
      .from("coin_ledger")
      .insert(ledgerEntry)
      .select()
      .single();

    if (ledgerError) {
      return NextResponse.json({ error: ledgerError.message }, { status: 400 });
    }

    await supabase
      .from("reward_events")
      .update({ processed: true })
      .eq("id", savedEvent.id);

    return NextResponse.json({
      ok: true,
      event: savedEvent,
      ledger: savedLedger,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to emit reward event." },
      { status: 500 }
    );
  }
}
