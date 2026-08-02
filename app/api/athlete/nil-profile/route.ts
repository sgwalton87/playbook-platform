import { NextRequest, NextResponse } from "next/server";
import { athleteApiFailure, requireSameOrigin, requireScholarAthleteApi } from "@/lib/scholar-athlete/api";
import { parseNILProfileCommand } from "@/lib/scholar-athlete/contracts";

export async function PUT(request: NextRequest) {
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin.response;
  const boundary = await requireScholarAthleteApi();
  if (!boundary.ok) return boundary.response;
  const parsed = parseNILProfileCommand(await request.json().catch(() => null));
  if (!parsed.ok) return athleteApiFailure(parsed.error, 422);
  const value = parsed.value;
  const { data: athlete } = await boundary.supabase
    .from("athlete_profiles")
    .select("id,athlete_level")
    .eq("id", value.athleteProfileId)
    .eq("scholar_id", boundary.authorization.identity.id)
    .maybeSingle();
  if (!athlete) return athleteApiFailure("Create your athlete profile before configuring NIL.", 409);
  const guardianProtectedLevel = ["youth", "middle_school", "high_school", "international"].includes(athlete.athlete_level);
  if (value.discoverable && guardianProtectedLevel) {
    const { data: existing } = await boundary.supabase
      .from("athlete_nil_profiles")
      .select("guardian_consent_at")
      .eq("scholar_id", boundary.authorization.identity.id)
      .maybeSingle();
    if (!existing?.guardian_consent_at) {
      return athleteApiFailure("Verified guardian consent is required before a youth or international athlete profile can enter marketplace discovery.", 409);
    }
  }
  const { data, error } = await boundary.supabase.from("athlete_nil_profiles").upsert({
    athlete_profile_id: value.athleteProfileId,
    scholar_id: boundary.authorization.identity.id,
    brand_statement: value.brandStatement,
    brand_values: value.brandValues,
    brand_categories: value.brandCategories,
    partnership_interests: value.partnershipInterests,
    social_presence: value.socialPresence,
    visibility: value.visibility,
    discoverable: value.discoverable,
    marketplace_consent_at: value.discoverable && value.marketplaceConsent ? new Date().toISOString() : null,
    provenance: { source: "athlete_self_report", recordedAt: new Date().toISOString() },
  }, { onConflict: "scholar_id" }).select("id").single();
  if (error || !data) return athleteApiFailure("The NIL profile could not be saved.");
  return NextResponse.json({ ok: true, nilProfileId: data.id });
}
