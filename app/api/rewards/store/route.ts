import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const [items, ledger, redemptions] = await Promise.all([
      supabase.from("store_products").select("id,product_key,name,category,coin_price,inventory,requires_approval,active").eq("active", true).order("coin_price"),
      supabase.from("coin_ledger").select("coins,xp,created_at").eq("scholar_id", user.id),
      supabase.from("store_redemptions").select("id,product_id,coins_spent,fulfillment_status,created_at").eq("scholar_id", user.id).order("created_at", { ascending: false }).limit(25),
    ]);
    const error = items.error || ledger.error || redemptions.error;
    if (error) throw new Error(error.message);

    const balance = (ledger.data || []).reduce((total, entry) => total + Number(entry.coins || 0), 0);
    const xp = (ledger.data || []).reduce((total, entry) => total + Number(entry.xp || 0), 0);
    return NextResponse.json({ ok: true, items: items.data || [], redemptions: redemptions.data || [], balance, xp });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reward store could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { productId?: unknown; shippingPayload?: unknown; requestId?: unknown };
    const productId = String(body.productId ?? "").trim();
    const requestId = String(body.requestId ?? "").trim();
    if (!productId || !requestId) return NextResponse.json({ error: "Product and idempotency request ID are required." }, { status: 400 });

    const result = await supabase.rpc("redeem_store_product", {
      product_id_input: productId,
      shipping_payload_input: body.shippingPayload && typeof body.shippingPayload === "object" ? body.shippingPayload : {},
      request_id_input: requestId,
    });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, redemption: result.data?.[0] || null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reward could not be redeemed." }, { status: 400 });
  }
}
