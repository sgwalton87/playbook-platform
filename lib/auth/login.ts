import { getCanonicalOnboardingRoute } from "@/lib/onboarding";
import { getRoleDestination, requirePlaybookRole } from "@/lib/roles/registry";

export type LoginProfile = {
  onboarding_completed: boolean | null;
  profile_mode: string | null;
  role: string | null;
};

export function getLoginDestination(
  profile: LoginProfile | null,
  metadataRole?: string | null
): string {
  // Durable profile truth always outranks mutable auth user metadata, including
  // before onboarding is complete. Metadata is only a bootstrap source when no
  // profile row exists yet.
  const role = requirePlaybookRole(
    profile?.profile_mode || profile?.role || metadataRole
  );

  return profile?.onboarding_completed
    ? getRoleDestination(role)
    : getCanonicalOnboardingRoute(role);
}

export function getLoginErrorMessage(): string {
  return "We couldn't log you in with those credentials. Check your email and password, then try again.";
}
