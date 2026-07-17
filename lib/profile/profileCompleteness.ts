import type {
  CanonicalProfile,
  ProfileCompleteness,
  ProfileCompletenessItem,
} from "./types";

function hasArrayValue(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

export function calculateProfileCompleteness(
  profile: CanonicalProfile
): ProfileCompleteness {
  const onboarding = profile.onboarding_data || {};

  const items: ProfileCompletenessItem[] = [
    {
      key: "full_name",
      label: "Name",
      complete: hasValue(profile.full_name),
    },
    {
      key: "username",
      label: "Username",
      complete: hasValue(profile.username),
    },
    {
      key: "avatar_url",
      label: "Profile photo",
      complete: hasValue(profile.avatar_url),
    },
    {
      key: "bio",
      label: "Biography",
      complete: hasValue(profile.bio),
    },
    {
      key: "school",
      label: "School",
      complete: hasValue(profile.school),
    },
    {
      key: "gpa",
      label: "GPA",
      complete: hasValue(profile.gpa),
    },
    {
      key: "graduation_year",
      label: "Graduation year",
      complete: hasValue(profile.graduation_year),
    },
    {
      key: "dream_school",
      label: "Dream school",
      complete:
        hasValue(profile.dream_school_name) ||
        hasValue(onboarding.dream_school),
    },
    {
      key: "activities",
      label: "Activities",
      complete: hasArrayValue(onboarding.activities),
    },
    {
      key: "support_network",
      label: "Support network",
      complete:
        hasArrayValue(onboarding.invite_supporters) ||
        hasArrayValue(onboarding.support_contacts),
    },
  ];

  const completed = items.filter(
    (item) => item.complete
  ).length;

  const total = items.length;

  return {
    percent: total
      ? Math.round((completed / total) * 100)
      : 0,
    completed,
    total,
    items,
    missing: items.filter((item) => !item.complete),
  };
}
