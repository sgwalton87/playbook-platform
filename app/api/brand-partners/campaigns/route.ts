import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const { data, error } = await supabase
      .from("nil_store_campaigns")
      .insert({
        partner_id: body.partnerId,
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
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("nil_store_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ campaigns: data || [] });
}
