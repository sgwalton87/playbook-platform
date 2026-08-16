import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const [items, ledger, redemptions] = await Promise.all([
      supabase.from("reward_store_items").select("id,name,description,coin_cost,inventory,fulfillment_type,status,image_url,sort_order").eq("status", "active").order("sort_order"),
      supabase.from("coin_ledger").select("coins,xp,created_at").eq("scholar_id", user.id),
      supabase.from("reward_store_redemptions").select("id,item_id,coin_cost,status,redeemed_at,fulfilled_at").eq("user_id", user.id).order("redeemed_at", { ascending: false }).limit(25),
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
    const body = await request.json() as { itemId?: unknown };
    const itemId = String(body.itemId ?? "").trim();
    if (!itemId) return NextResponse.json({ error: "Reward item is required." }, { status: 400 });

    const result = await supabase.rpc("redeem_reward_store_item", { requested_item_id: itemId });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, redemption: result.data?.[0] || null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reward could not be redeemed." }, { status: 400 });
  }
}
