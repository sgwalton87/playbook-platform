import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioShare } from "@/lib/portfolio-sharing";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const scholarId = body.scholarId || user.id;

    if (body.scholarId && body.scholarId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const share = buildPortfolioShare({
      scholarId,
      scholarName: body.scholarName,
      targetUse: body.targetUse,
      packet: body.packet,
      expiresAt: body.expiresAt,
    });

    const { data, error } = await supabase
      .from("portfolio_shares")
      .insert({
        share_id: share.id,
        scholar_id: scholarId,
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
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedScholarId = req.nextUrl.searchParams.get("scholarId");
  const scholarId = requestedScholarId || user.id;

  if (requestedScholarId && requestedScholarId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
