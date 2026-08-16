import { NextRequest, NextResponse } from "next/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });

    const body = await req.json() as Record<string, unknown>;
    if (body.scholarId != null && String(body.scholarId) !== user.id) {
      return NextResponse.json({ error: "Store redemptions may only be created for the authenticated learner." }, { status: 403 });
    }
    if (body.coinPrice != null) {
      return NextResponse.json({ error: "Coin price is determined by the canonical store product and cannot be supplied by the client." }, { status: 400 });
    }

    const productId = String(body.productId ?? "").trim();
    const requestId = String(body.requestId ?? "").trim();
    if (!productId || !requestId) {
      return NextResponse.json({ error: "Product ID and redemption request ID are required." }, { status: 400 });
    }

    const shippingPayload = body.shippingPayload && typeof body.shippingPayload === "object" && !Array.isArray(body.shippingPayload)
      ? body.shippingPayload
      : {};

    const { data, error } = await supabase.rpc("redeem_store_product", {
      product_id_input: productId,
      shipping_payload_input: shippingPayload,
      request_id_input: requestId,
    });
    if (error) throw new Error(error.message);

    const result = Array.isArray(data) ? data[0] : data;
    if (!result) throw new Error("Store redemption returned no result.");

    return NextResponse.json({
      ok: true,
      redemption: {
        id: result.redemption_id,
        coinsSpent: result.coins_spent,
        remainingBalance: result.remaining_balance,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to redeem store product." }, { status: 400 });
  }
}
