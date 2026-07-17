export type ProfileRole =
  | "scholar"
  | "scholar-athlete"
  | "brand-partner"
  | "family"
  | "mentor"
  | "educator"
  | "coach"
  | "college-coach"
  | "college-admissions"
  | "transition-youth"
  | "employer"
  | "founder"
  | "other";

export type ActivityEntry = {
  id?: string;
  category?: string;
  activity?: string;
  roleTitle?: string;
  organization?: string;
  description?: string;
  hoursPerWeek?: number | string;
  totalHours?: number | string;
  supervisor?: string;
  supervisorEmail?: string;
};

export type SupportContact = {
  id?: string;
  name?: string;
  email: string;
  relationship?: string;
  invitationStatus?:
    | "draft"
    | "sent"
    | "accepted"
    | "expired";
  invitationToken?: string;
  linkedProfileId?: string;
  messageThreadId?: string;
};

export type CanonicalProfile = {
  id: string;
  email?: string | null;

  role: ProfileRole | string;
  profile_mode: ProfileRole | string;

  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;

  gender?: string | null;
  date_of_birth?: string | null;
  favorite_quote?: string | null;
  city?: string | null;
  zip_code?: string | null;

  school?: string | null;
  school_district?: string | null;
  grade?: string | number | null;
  gpa?: number | string | null;
  weighted_gpa?: number | string | null;
  unweighted_gpa?: number | string | null;
  graduation_year?: number | string | null;
  ela_score?: number | string | null;
  math_score?: number | string | null;
  sat_score?: number | string | null;
  act_score?: number | string | null;

  intended_major?: string | null;
  ideal_profession?: string | null;

  dream_school?: string | null;
  dream_school_name?: string | null;
  dream_school_id?: string | null;
  top_schools?: string[];

  pillars?: string[];
  activities?: ActivityEntry[];
  engagement_preferences?: string[];
  supporters?: SupportContact[] | string[];

  race_ethnicity?: string[];
  lgbtqia_affinity?: string | null;
  household_income?: string | null;
  first_generation?: string | boolean | null;
  ell_status?: string | boolean | null;
  free_reduced_lunch?: string | boolean | null;
  migrant_student?: string | boolean | null;
  foster_youth?: string | boolean | null;
  housing_insecurity?: string | boolean | null;
  has_iep?: string | boolean | null;

  primary_sport?: string | null;
  secondary_sport?: string | null;
  position?: string | null;
  current_team?: string | null;
  height_weight?: string | null;
  key_stats_honors?: string | null;
  highlight_reel_url?: string | null;
  recruiting_status?: string | null;
  desired_college_level?: string | null;
  athlete_email?: string | null;

  transcript_url?: string | null;
  transcript_filename?: string | null;
  transcript_uploaded_at?: string | null;
  transcript_courses?: Array<Record<string, unknown>>;
  ag_progress?: Array<Record<string, unknown>>;

  onboarding_data: Record<string, unknown>;
  onboarding_complete?: boolean;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;

  public_profile_complete?: boolean;

  community_safety_agreed?: boolean;
  community_safety_agreed_at?: string | null;
  community_safety_policy_version?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type ProfilePatch = Partial<
  Omit<CanonicalProfile, "id" | "onboarding_data">
> & {
  id: string;
  onboarding_data?: Record<string, unknown>;
};

export type ProfileCompletenessItem = {
  key: string;
  label: string;
  complete: boolean;
};

export type ProfileCompleteness = {
  percent: number;
  completed: number;
  total: number;
  items: ProfileCompletenessItem[];
  missing: ProfileCompletenessItem[];
};
