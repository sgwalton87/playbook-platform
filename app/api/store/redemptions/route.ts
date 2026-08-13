import { NextRequest, NextResponse } from "next/server";
import { buildRedemptionTransaction } from "@/lib/store-economy";
import { parseStoreRedemptionPayload } from "@/lib/api/contracts/store";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const parsed = parseStoreRedemptionPayload(payload);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const body = parsed.value;

  if (body.scholarId && body.scholarId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scholarId = body.scholarId || user.id;

  const { data: ledger } = await supabase
    .from("coin_ledger")
    .select("coins,xp")
    .eq("scholar_id", scholarId);

  const balance = (ledger || []).reduce((sum, entry) => sum + Number(entry.coins || 0), 0);

  const transaction = buildRedemptionTransaction({
    scholarId,
    productId: body.productId,
    coinPrice: body.coinPrice,
    currentBalance: balance,
  });

  if (!transaction.ok) {
    return NextResponse.json(transaction, { status: 400 });
  }

  const { data, error } = await supabase
    .from("store_redemptions")
    .insert({
      scholar_id: scholarId,
      product_id: body.productId,
      coins_spent: body.coinPrice,
      shipping_payload: body.shippingPayload || {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("coin_ledger").insert({
    scholar_id: scholarId,
    event_type: "store.redemption",
    source_id: data.id,
    coins: -Math.abs(body.coinPrice),
    xp: 25,
    reason: "Redeemed a store reward",
  });

  return NextResponse.json({ ok: true, redemption: data, transaction });
}
