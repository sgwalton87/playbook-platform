import type { CanonicalProfile } from "./types";

export function createProfileDefaults(
  id: string,
  email?: string | null,
  role = "scholar"
): CanonicalProfile {
  return {
    id,
    email: email || null,

    role,
    profile_mode: role,

    first_name: null,
    last_name: null,
    full_name: null,
    username: null,
    avatar_url: null,
    cover_url: null,
    bio: null,

    gender: null,
    date_of_birth: null,
    favorite_quote: null,
    city: null,
    zip_code: null,

    school: null,
    school_district: null,
    grade: null,
    gpa: null,
    weighted_gpa: null,
    unweighted_gpa: null,
    graduation_year: null,
    ela_score: null,
    math_score: null,
    sat_score: null,
    act_score: null,

    intended_major: null,
    ideal_profession: null,

    dream_school: null,
    dream_school_name: null,
    dream_school_id: null,
    top_schools: [],

    pillars: [],
    activities: [],
    engagement_preferences: [],
    supporters: [],

    race_ethnicity: [],
    lgbtqia_affinity: null,
    household_income: null,
    first_generation: null,
    ell_status: null,
    free_reduced_lunch: null,
    migrant_student: null,
    foster_youth: null,
    housing_insecurity: null,
    has_iep: null,

    primary_sport: null,
    secondary_sport: null,
    position: null,
    current_team: null,
    height_weight: null,
    key_stats_honors: null,
    highlight_reel_url: null,
    recruiting_status: null,
    desired_college_level: null,
    athlete_email: null,

    onboarding_data: {},
    onboarding_complete: false,
    onboarding_completed: false,

    created_at: null,
    updated_at: null,
  };
}

export function normalizeString(
  value: unknown
): string | null {
  if (typeof value !== "string") return null;

  const clean = value.trim();

  return clean.length ? clean : null;
}

export function normalizeUsername(
  value: unknown
): string | null {
  const clean = normalizeString(value);

  if (!clean) return null;

  return clean
    .replace(/^@/, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}
