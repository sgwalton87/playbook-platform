import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const bodyPartnerId = body.partnerId || user.id;

    const { data, error } = await supabase
      .from("nil_store_campaigns")
      .insert({
        partner_id: bodyPartnerId,
        athlete_profile_id: body.athleteProfileId,
        product_id: body.productId,
        title: body.title,
        description: body.description || null,
        status: body.status || "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, campaign: data });
  } catch {
    return NextResponse.json(
      { error: "Unable to create campaign." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("nil_store_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ campaigns: data || [] });
}
