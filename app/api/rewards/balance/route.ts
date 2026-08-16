import { NextRequest, NextResponse } from "next/server";
import { calculateRewardBalance } from "@/lib/reward-events";
import { requireUser } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const requestedScholarId = req.nextUrl.searchParams.get("scholarId");
    if (requestedScholarId && requestedScholarId !== user.id) {
      return NextResponse.json({ error: "Reward balance is private to the authenticated account." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("coin_ledger")
      .select("id,scholar_id,event_type,source_id,coins,xp,reason,created_at")
      .eq("scholar_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      entries: data || [],
      balance: calculateRewardBalance(data || []),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load reward balance." }, { status: 400 });
  }
}
