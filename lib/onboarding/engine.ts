import { ROLE_ONBOARDING } from "./config/roleConfigs";
import { normalizeRole, getPathway } from "./pathwayMap";
import type { OnboardingData, OnboardingStep } from "./types";

export function getOnboardingSteps(role?: string | null): OnboardingStep[] {
  const normalized = normalizeRole(role);
  return ROLE_ONBOARDING[normalized] || ROLE_ONBOARDING.scholar;
}

export function getCanonicalOnboardingRoute(role?: string | null): string {
  const normalized = normalizeRole(role);
  return `/start?first=1&role=${encodeURIComponent(normalized)}`;
}

export function getOnboardingCompletionDestination(role?: string | null): string {
  return getPathway(normalizeRole(role)).osRoute;
}

export function createInitialOnboardingData(profile: Record<string, unknown> | null | undefined): OnboardingData {
  const onboarding = (profile?.onboarding_data || {}) as OnboardingData;
  return {
    full_name: (profile?.full_name as string) || "",
    username: (profile?.username as string) || "",
    avatar_url: (profile?.avatar_url as string) || "",
    bio: (profile?.bio as string) || "",
    school: (profile?.school as string) || "",
    grade: (profile?.grade as string) || "",
    dream_school: (profile?.dream_school as string) || "",
    ideal_profession: (profile?.ideal_profession as string) || "",
    top_schools: Array(10).fill(""),
    activities: Array(8).fill(""),
    invite_supporters: Array(5).fill(""),
    ...onboarding,
  };
}
