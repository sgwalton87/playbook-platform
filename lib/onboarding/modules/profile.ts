import {
  mapOnboardingToProfile,
  saveProfile,
  type CanonicalProfile,
} from "@/lib/profile";

type SaveProfileModuleInput = {
  userId: string;
  email?: string | null;
  role: string;
  normalizedForm: Record<string, any>;
  existingOnboardingData: Record<string, unknown>;
  stepIndex: number;
  complete: boolean;
};

export async function saveProfileModule({
  userId,
  email,
  role,
  normalizedForm,
  existingOnboardingData,
  stepIndex,
  complete,
}: SaveProfileModuleInput): Promise<{
  profile: CanonicalProfile | null;
  error: Error | null;
}> {
  const mapped = mapOnboardingToProfile({
    userId,
    email,
    role,
    form: normalizedForm,
    existingOnboardingData,
    complete,
  });

  const safetyAgreed = Boolean(
    normalizedForm.community_safety_agreed
  );

  const result = await saveProfile({
    ...mapped,

    grade: normalizedForm.grade || null,
    dream_school: normalizedForm.dream_school || null,
    ideal_profession: normalizedForm.ideal_profession || null,

    onboarding_data: {
      ...existingOnboardingData,
      ...normalizedForm,
      role,
      profile_mode: role,
      onboarding_step_index: stepIndex,
      last_saved_at: new Date().toISOString(),
    },

    onboarding_complete: complete,
    onboarding_completed: complete,
    onboarding_completed_at: complete
      ? new Date().toISOString()
      : null,

    public_profile_complete: Boolean(
      normalizedForm.full_name &&
      normalizedForm.username &&
      normalizedForm.bio
    ),

    community_safety_agreed: safetyAgreed,
    community_safety_agreed_at: safetyAgreed
      ? new Date().toISOString()
      : null,

    community_safety_policy_version: safetyAgreed
      ? "playbook-safety-v1"
      : null,
  });

  return {
    profile: result.profile,
    error: result.error,
  };
}
