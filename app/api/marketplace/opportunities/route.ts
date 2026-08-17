import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const result = await supabase.rpc("get_marketplace_opportunities");
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ opportunities: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Marketplace opportunities could not be loaded." }, { status: 500 });
  }
}
