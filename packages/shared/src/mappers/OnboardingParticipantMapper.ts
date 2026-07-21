import { Participant } from "../models";

export type OnboardingInput = Record<string, unknown>;

export function mapOnboardingToParticipant(
  input: OnboardingInput
): Participant {

  // Temporary implementation.
  // We'll replace this with a strongly typed mapper
  // as we migrate onboarding section-by-section.

  return input as unknown as Participant;

}
