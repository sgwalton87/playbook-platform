import { getCanonicalOnboardingRoute } from "@/lib/onboarding";
import { getRoleDestination, normalizePlaybookRole } from "@/lib/roles/registry";

export type LoginProfile = {
  onboarding_completed: boolean | null;
  profile_mode: string | null;
  role: string | null;
};

export function getLoginDestination(
  profile: LoginProfile | null,
  metadataRole?: string | null
): string {
  const role = normalizePlaybookRole(profile?.onboarding_completed
    ? profile.profile_mode || profile.role || metadataRole
    : metadataRole || profile?.profile_mode || profile?.role);

  return profile?.onboarding_completed
    ? getRoleDestination(role)
    : getCanonicalOnboardingRoute(role);
}

export function getLoginErrorMessage(): string {
  return "We couldn't log you in with those credentials. Check your email and password, then try again.";
}
