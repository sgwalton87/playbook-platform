import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { calculateRewardBalance } from "@/lib/reward-events";

export async function GET(req: NextRequest) {
  const scholarId = req.nextUrl.searchParams.get("scholarId");

  if (!scholarId) {
    return NextResponse.json({ error: "Missing scholarId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("coin_ledger")
    .select("*")
    .eq("scholar_id", scholarId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    entries: data || [],
    balance: calculateRewardBalance(data || []),
  });
}
