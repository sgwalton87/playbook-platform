import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  buildCoinLedgerEntry,
  buildRewardEvent,
  type RewardEventType,
} from "@/lib/reward-events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event = buildRewardEvent({
      scholarId: body.scholarId,
      eventType: body.eventType as RewardEventType,
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
      scholarId: body.scholarId,
      eventType: body.eventType as RewardEventType,
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
