import { getRoleDefinition, normalizePlaybookRole } from "@/lib/roles/registry";

export type SupportedOnboardingCompletionRole =
  | "scholar"
  | "scholar-athlete"
  | "transition-youth"
  | "educator"
  | "high-school-counselor"
  | "coach";

/**
 * This guard permits only roles whose next governed onboarding action is
 * implemented. Learner roles can complete immediately through their role-bound
 * PBOS adapter. Institutional roles may submit independent verification
 * evidence, but remain incomplete and route to /pending until privileged review.
 * Relationship-gated and authority-pending roles remain fail-closed.
 */
export function assertRoleOnboardingCompletionSupported(
  role?: string | null
): SupportedOnboardingCompletionRole {
  const normalized = normalizePlaybookRole(role);
  if (
    normalized !== "scholar" &&
    normalized !== "scholar-athlete" &&
    normalized !== "transition-youth" &&
    normalized !== "educator" &&
    normalized !== "high-school-counselor" &&
    normalized !== "coach"
  ) {
    const definition = getRoleDefinition(normalized);
    throw new Error(
      `${definition.label} onboarding is saved but cannot advance until its governed role adapter is connected.`
    );
  }
  return normalized;
}
