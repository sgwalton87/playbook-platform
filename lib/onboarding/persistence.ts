import {
  type CanonicalProfile,
} from "@/lib/profile";
import { saveProfileModule } from "./modules";

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

  const result = await saveProfileModule({
    userId,
    email,
    role,
    normalizedForm,
    existingOnboardingData,
    stepIndex,
    complete,
  });

  return {
    profile: result.profile,
    normalizedForm,
    error: result.error,
  };
}
