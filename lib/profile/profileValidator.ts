import type { ProfilePatch } from "./types";

export type ProfileValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export function validateProfileIdentity(
  profile: ProfilePatch
): ProfileValidationResult {
  const errors: Record<string, string> = {};

  if (!profile.full_name?.trim()) {
    errors.full_name = "Full name is required.";
  }

  if (!profile.username?.trim()) {
    errors.username = "Username is required.";
  } else if (
    !/^[a-z0-9._-]{3,30}$/i.test(profile.username)
  ) {
    errors.username =
      "Username must be 3–30 characters and use letters, numbers, periods, underscores, or hyphens.";
  }

  if (!profile.role) {
    errors.role = "Profile role is required.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
