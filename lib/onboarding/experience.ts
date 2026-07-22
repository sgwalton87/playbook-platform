export type OnboardingFormState = Record<string, unknown>;

export function getNextOnboardingStep(current: number, total: number) {
  return Math.min(current + 1, Math.max(total - 1, 0));
}

export function getOnboardingValidationError({
  stepId,
  form,
  skip = false,
  isLast = false,
}: {
  stepId: string;
  form: OnboardingFormState;
  skip?: boolean;
  isLast?: boolean;
}) {
  if (!skip && stepId === "identity") {
    const fullName = String(form.full_name || "").trim();
    const username = String(form.username || "").trim();

    if (!fullName || !username) {
      return "Add your full name and username before moving to the next play.";
    }
  }

  if (isLast && !form.community_safety_agreed) {
    return "Review and accept the Community Safety Agreement before creating your profile.";
  }

  return null;
}
