import {
  normalizeString,
  normalizeUsername,
} from "./profileDefaults";

import type {
  ProfilePatch,
} from "./types";

type OnboardingForm =
  Record<string, any>;

function splitName(
  fullName: string | null
) {
  if (!fullName) {
    return {
      first_name: null,
      last_name: null,
    };
  }

  const parts = fullName
    .split(/\s+/)
    .filter(Boolean);

  return {
    first_name:
      parts[0] || null,
    last_name:
      parts.length > 1
        ? parts.slice(1).join(" ")
        : null,
  };
}

function normalizedArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      String(item || "").trim()
    )
    .filter(Boolean);
}

export function mapOnboardingToProfile({
  userId,
  email,
  role,
  form,
  existingOnboardingData = {},
  complete = false,
}: {
  userId: string;
  email?: string | null;
  role: string;
  form: OnboardingForm;
  existingOnboardingData?: Record<
    string,
    unknown
  >;
  complete?: boolean;
}): ProfilePatch {
  const fullName =
    normalizeString(
      form.full_name
    ) ||
    normalizeString(
      [
        form.first_name,
        form.last_name,
      ]
        .filter(Boolean)
        .join(" ")
    );

  const names =
    splitName(fullName);

  const mergedOnboardingData = {
    ...existingOnboardingData,
    ...form,

    role,
    profile_mode: role,

    first_name:
      normalizeString(
        form.first_name
      ) || names.first_name,

    last_name:
      normalizeString(
        form.last_name
      ) || names.last_name,

    full_name: fullName,

    race_ethnicity:
      normalizedArray(
        form.race_ethnicity ||
          form.race
      ),

    top_schools:
      normalizedArray(
        form.top_schools ||
          form.college_list
      ),

    pillars:
      normalizedArray(
        form.pillars
      ),

    engagement_preferences:
      normalizedArray(
        form.engagement_preferences
      ),

    invite_supporters:
      normalizedArray(
        form.invite_supporters
      ),

    last_saved_at:
      new Date().toISOString(),
  };

  return {
    id: userId,
    email: email || null,

    role,
    profile_mode: role,

    full_name: fullName,

    first_name:
      normalizeString(
        form.first_name
      ) || names.first_name,

    last_name:
      normalizeString(
        form.last_name
      ) || names.last_name,

    username:
      normalizeUsername(
        form.username
      ),

    avatar_url:
      normalizeString(
        form.avatar_url
      ),

    cover_url:
      normalizeString(
        form.cover_url
      ),

    bio:
      normalizeString(
        form.bio
      ),

    school:
      normalizeString(
        form.school
      ),

    grade:
      form.grade === undefined ||
      form.grade === ""
        ? null
        : form.grade,

    gpa:
      form.gpa === undefined ||
      form.gpa === ""
        ? null
        : form.gpa,

    intended_major:
      normalizeString(
        form.intended_major
      ) ||
      normalizeString(
        form.target_major
      ),

    ideal_profession:
      normalizeString(
        form.ideal_profession
      ),

    dream_school:
      normalizeString(
        form.dream_school
      ),

    dream_school_name:
      normalizeString(
        form.dream_school_name
      ) ||
      normalizeString(
        form.dream_school
      ),

    dream_school_id:
      normalizeString(
        form.dream_school_id
      ),

    onboarding_data:
      mergedOnboardingData,

    onboarding_complete:
      complete,

    onboarding_completed:
      complete,

    onboarding_completed_at:
      complete
        ? new Date().toISOString()
        : undefined,

    updated_at:
      new Date().toISOString(),
  };
}
