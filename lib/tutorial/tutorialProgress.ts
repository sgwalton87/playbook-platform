import { getPathway } from "@/lib/onboarding/pathwayMap";

export type TutorialProfile = {
  id?: string | null;
  onboarding_completed?: boolean | null;
  onboarding_data?: Record<string, unknown> | null;
  profile_mode?: string | null;
  role?: string | null;
};

export function isTutorialComplete(profile?: TutorialProfile | null) {
  return Boolean(profile?.onboarding_data?.tutorial_completed);
}

export function getPostOnboardingDestination(profile?: TutorialProfile | null) {
  if (profile?.onboarding_completed && !isTutorialComplete(profile)) {
    return "/tutorial";
  }

  return getPathway(profile?.profile_mode || profile?.role).osRoute;
}

export function withTutorialRequired(
  onboardingData: Record<string, unknown> | null | undefined,
  completedAt: string | null = null
) {
  return {
    ...(onboardingData || {}),
    tutorial_required: true,
    tutorial_completed: false,
    tutorial_completed_at: completedAt,
  };
}

export function withTutorialComplete(onboardingData: Record<string, unknown> | null | undefined) {
  return {
    ...(onboardingData || {}),
    tutorial_required: false,
    tutorial_completed: true,
    tutorial_completed_at: new Date().toISOString(),
  };
}
