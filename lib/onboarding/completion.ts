import {
  PLAYBOOK_ROLES,
  requirePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";

export type SupportedOnboardingCompletionRole = PlaybookRole;

/**
 * Assert that the selected role has its own registered onboarding contract.
 * This authorizes submission of the role-specific profile only; it does not
 * activate relationship, institutional, recruiting, hiring, or data-access
 * authority. Those gates remain server-side and role-specific.
 *
 * The legacy function name is retained because the existing onboarding client
 * calls it before persisting the final step.
 */
export function assertRoleOnboardingCompletionSupported(
  role?: string | null
): SupportedOnboardingCompletionRole {
  const normalized = requirePlaybookRole(role);
  if (!PLAYBOOK_ROLES[normalized].onboarding) {
    throw new Error(`${normalized} does not have an onboarding contract.`);
  }
  return normalized;
}
