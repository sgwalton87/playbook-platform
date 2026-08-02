import { NextRequest, NextResponse } from "next/server";
import { athleteApiFailure, requireSameOrigin, requireScholarAthleteApi } from "@/lib/scholar-athlete/api";
import { parseAthleteProfileCommand } from "@/lib/scholar-athlete/contracts";
import { incrementMetric } from "@/lib/observability";

export async function PUT(request: NextRequest) {
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin.response;
  const boundary = await requireScholarAthleteApi();
  if (!boundary.ok) return boundary.response;
  const parsed = parseAthleteProfileCommand(await request.json().catch(() => null));
  if (!parsed.ok) return athleteApiFailure(parsed.error, 422);
  const value = parsed.value;
  const { data, error } = await boundary.supabase.from("athlete_profiles").upsert({
    scholar_id: boundary.authorization.identity.id,
    sport: value.sport,
    secondary_sport: value.secondarySport,
    position: value.position,
    secondary_position: value.secondaryPosition,
    graduation_year: value.graduationYear,
    athlete_level: value.athleteLevel,
    governing_path: value.governingPath,
    bio: value.bio,
    location: value.location,
    highlight_url: value.highlightUrl,
    teams: value.teams,
    leagues: value.leagues,
    awards: value.awards,
    leadership_experience: value.leadershipExperience,
    visibility: value.visibility,
    provenance: { source: "athlete_self_report", recordedAt: new Date().toISOString() },
    consent_scope: value.visibility === "private" ? ["owner"] : ["owner", value.visibility],
  }, { onConflict: "scholar_id" }).select("id").single();
  if (error || !data) return athleteApiFailure("The athlete profile could not be saved.");
  incrementMetric("athlete_profile_completion_total");
  return NextResponse.json({ ok: true, profileId: data.id });
}
