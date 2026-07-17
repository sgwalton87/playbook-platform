import { createDefaultAthletics } from "./defaults";
import type { AthleticsProfile } from "./types";

type BuilderInput = {
  row?: Record<string, any>;
  onboarding?: Record<string, any>;
};

function first(...values: any[]) {
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

function arr(value: any): string[] {
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

  const primarySport = first(
    row.primary_sport,
    onboarding.primary_sport
  );

  const secondarySport = first(
    row.secondary_sport,
    onboarding.secondary_sport
  );

  if (primarySport) {

    athletics.status.isAthlete = true;

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

  const team = first(
    row.current_team,
    onboarding.current_team
  );

  if (team) {

    athletics.affiliations.push({

      id: crypto.randomUUID(),

      organization: String(team),

      team: String(team),

      current: true,

    });

  }

  const highlight = first(
    row.highlight_reel_url,
    onboarding.highlight_reel_url,
    onboarding.highlight_link
  );

  if (highlight) {

    athletics.media.highlightVideo =
      String(highlight);

  }

  athletics.recruiting.desiredLevels =
    arr(
      first(
        row.desired_college_level,
        onboarding.desired_college_level,
        row.target_division,
        onboarding.target_division
      )
    );

  athletics.recruiting.recruitingEmail =
    first(
      row.athlete_email,
      onboarding.athlete_email
    );

  return athletics;

}
