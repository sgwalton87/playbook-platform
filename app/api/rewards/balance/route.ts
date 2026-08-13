import { NextRequest, NextResponse } from "next/server";
import { calculateRewardBalance } from "@/lib/reward-events";
import { requireUser } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const requestedScholarId = req.nextUrl.searchParams.get("scholarId");
  const scholarId = requestedScholarId || user.id;

  if (requestedScholarId && requestedScholarId !== user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
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
