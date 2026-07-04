import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { evaluateCampaignReadiness } from "@/lib/brand-partners";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const readiness = evaluateCampaignReadiness({
    status: body.status || "review",
    deliverables: body.deliverables || [],
    disclosureApproved: body.disclosureApproved || false,
    athleteApproved: body.athleteApproved || false,
  });

  const { data, error } = await supabase
    .from("nil_store_campaigns")
    .insert({
      partner_id: body.partnerId,
      store_product_id: body.storeProductId,
      scholar_id: body.scholarId,
      athlete_profile_id: body.athleteProfileId,
      nil_deal_id: body.nilDealId,
      status: body.status || "review",
      deliverables: body.deliverables || [],
      disclosure_approved: body.disclosureApproved || false,
      athlete_approved: body.athleteApproved || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, campaign: data, readiness });
}
