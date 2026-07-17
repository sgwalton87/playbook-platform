import {
  mapOnboardingToProfile,
  saveProfile,
  type CanonicalProfile,
} from "@/lib/profile";

type OnboardingForm = Record<string, any>;

export type PersistOnboardingInput = {
  userId: string;
  email?: string | null;
  role: string;
  form: OnboardingForm;
  existingOnboardingData?: Record<string, unknown>;
  stepIndex: number;
  complete?: boolean;
};

export type PersistOnboardingResult = {
  profile: CanonicalProfile | null;
  normalizedForm: OnboardingForm;
  error: Error | null;
};

function compactArray(value: unknown): unknown[] {
  return Array.isArray(value)
    ? value.filter((item) => {
        if (typeof item === "string") {
          return item.trim().length > 0;
        }

        return Boolean(item);
      })
    : [];
}

export async function persistOnboardingProfile({
  userId,
  email,
  role,
  form,
  existingOnboardingData = {},
  stepIndex,
  complete = false,
}: PersistOnboardingInput): Promise<PersistOnboardingResult> {
  const normalizedForm: OnboardingForm = {
    ...form,
    top_schools: compactArray(form.top_schools),
    activities: compactArray(form.activities),
    invite_supporters: compactArray(form.invite_supporters),
    onboarding_step_index: stepIndex,
  };

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
    dream_school:
      normalizedForm.dream_school || null,
    ideal_profession:
      normalizedForm.ideal_profession || null,

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
    normalizedForm,
    error: result.error,
  };
}
