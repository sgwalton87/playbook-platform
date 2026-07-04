import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { buildPortfolioShare } from "@/lib/portfolio-sharing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const share = buildPortfolioShare({
      scholarId: body.scholarId,
      scholarName: body.scholarName,
      targetUse: body.targetUse,
      packet: body.packet,
      expiresAt: body.expiresAt,
    });

    const { data, error } = await supabase
      .from("portfolio_shares")
      .insert({
        share_id: share.id,
        scholar_id: body.scholarId,
        scholar_name: share.scholarName,
        target_use: share.targetUse,
        packet: share.packet,
        status: share.status,
        expires_at: share.expiresAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      share: data,
      shareUrl: `/portfolio/${data.share_id}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create portfolio share." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const scholarId = req.nextUrl.searchParams.get("scholarId");

  if (!scholarId) {
    return NextResponse.json({ error: "Missing scholarId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("portfolio_shares")
    .select("*")
    .eq("scholar_id", scholarId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ shares: data || [] });
}
