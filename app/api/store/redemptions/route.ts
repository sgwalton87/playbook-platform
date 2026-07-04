import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { buildRedemptionTransaction } from "@/lib/store-economy";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data: ledger } = await supabase
    .from("coin_ledger")
    .select("coins,xp")
    .eq("scholar_id", body.scholarId);

  const balance = (ledger || []).reduce((sum, entry) => sum + Number(entry.coins || 0), 0);

  const transaction = buildRedemptionTransaction({
    scholarId: body.scholarId,
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
      scholar_id: body.scholarId,
      product_id: body.productId,
      coins_spent: body.coinPrice,
      shipping_payload: body.shippingPayload || {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("coin_ledger").insert({
    scholar_id: body.scholarId,
    event_type: "store.redemption",
    source_id: data.id,
    coins: -Math.abs(body.coinPrice),
    xp: 25,
    reason: "Redeemed a store reward",
  });

  return NextResponse.json({ ok: true, redemption: data, transaction });
}
