import type { OnboardingData, OnboardingStep } from "./types";

export function validateOnboardingStep(step: OnboardingStep, data: OnboardingData): string[] {
  if (step.fields.some((field) => field.type === "safety-agreement") && !data.community_safety_agreed) {
    return ["Please read and agree to The Playbook Community Safety Agreement before creating your profile."];
  }
  return [];
}
