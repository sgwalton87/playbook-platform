import { createDefaultAthletics } from "./defaults";
import type { AthleticsProfile } from "./types";

type BuilderInput = {
  row?: Record<string, unknown>;
  onboarding?: Record<string, unknown>;
};

function first(...values: unknown[]): unknown {
  for (const v of values) {
    if (
      v !== undefined &&
      v !== null &&
      v !== ""
    ) {
      return v;
    }
  }

  return null;
}

function arr(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  return [String(value)];
}

export function buildAthleticsProfile({
  row = {},
  onboarding = {},
}: BuilderInput): AthleticsProfile {
  const athletics = createDefaultAthletics();

  // ------------------------------------------------------------------
  // SPORTS
  // ------------------------------------------------------------------

  const primarySport = first(
    row.sport,
    onboarding.sport,
    row.primary_sport,
    onboarding.primary_sport
  );

  const secondarySport = first(
    row.secondary_sport,
    onboarding.secondary_sport
  );

  if (primarySport) {
    athletics.status.isAthlete = true;
    athletics.status.careerStage = "high-school";

    athletics.sports.push({
      id: crypto.randomUUID(),
      sport: String(primarySport),
      discipline: "",
      primary: true,
      positions: arr(
        first(
          row.position,
          onboarding.position
        )
      ),
      events: [],
      classifications: [],
    });
  }

  if (secondarySport) {
    athletics.sports.push({
      id: crypto.randomUUID(),
      sport: String(secondarySport),
      discipline: "",
      primary: false,
      positions: [],
      events: [],
      classifications: [],
    });
  }

  // ------------------------------------------------------------------
  // TEAMS
  // ------------------------------------------------------------------

  const highSchoolTeam = first(
    row.high_school_team,
    onboarding.high_school_team
  );

  const travelTeam = first(
    row.travel_team,
    onboarding.travel_team,
    row.current_team,
    onboarding.current_team
  );

  const teamLevel = first(
    row.team_level,
    onboarding.team_level
  );

  const jersey = first(
    row.jersey_number,
    onboarding.jersey_number
  );

  if (highSchoolTeam) {
    athletics.affiliations.push({
      id: crypto.randomUUID(),
      organization: String(highSchoolTeam),
      team: String(highSchoolTeam),
      current: true,
      level: teamLevel ? String(teamLevel) : undefined,
      jerseyNumber: jersey ? String(jersey) : undefined,
    });
  }

  if (travelTeam) {
    athletics.affiliations.push({
      id: crypto.randomUUID(),
      organization: String(travelTeam),
      team: String(travelTeam),
      current: true,
    });
  }

  // ------------------------------------------------------------------
  // MEASUREMENTS
  // ------------------------------------------------------------------

  const height = first(
    row.height,
    onboarding.height
  );

  const weight = first(
    row.weight,
    onboarding.weight
  );

  if (height) {
    athletics.measurements.push({
      id: crypto.randomUUID(),
      type: "Height",
      value: String(height),
    });
  }

  if (weight) {
    athletics.measurements.push({
      id: crypto.randomUUID(),
      type: "Weight",
      value: String(weight),
      unit: "lbs",
    });
  }

  // ------------------------------------------------------------------
  // COACH
  // ------------------------------------------------------------------

  const coachName = first(
    row.coach_name,
    onboarding.coach_name
  );

  const coachEmail = first(
    row.coach_email,
    onboarding.coach_email
  );

  if (coachName || coachEmail) {
    athletics.contacts.push({
      id: crypto.randomUUID(),
      name: coachName ? String(coachName) : "Coach",
      role: "Coach",
      email:
        typeof coachEmail === "string"
          ? coachEmail
          : undefined,
    });
  }

  // ------------------------------------------------------------------
  // MEDIA
  // ------------------------------------------------------------------

  const highlight = first(
    row.highlight_reel_url,
    onboarding.highlight_reel_url,
    onboarding.highlight_link
  );

  if (highlight) {
    athletics.media.highlightVideo = String(highlight);
  }

  // ------------------------------------------------------------------
  // RECRUITING
  // ------------------------------------------------------------------

  athletics.recruiting.openToRecruiting =
    Boolean(
      first(
        row.recruiting_interest,
        onboarding.recruiting_interest
      )
    );

  athletics.recruiting.desiredLevels = arr(
    first(
      row.desired_college_level,
      onboarding.desired_college_level,
      row.target_division,
      onboarding.target_division
    )
  );

  const recruitingEmail = first(
    row.athlete_email,
    onboarding.athlete_email
  );

  if (typeof recruitingEmail === "string") {
    athletics.recruiting.recruitingEmail =
      recruitingEmail;
  }

  return athletics;
}
