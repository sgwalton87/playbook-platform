import { getRoleDefinition, normalizePlaybookRole } from "@/lib/roles/registry";

export type SupportedOnboardingCompletionRole = "scholar" | "scholar-athlete";

/**
 * A role may only be marked complete after its durable execution adapter is
 * connected. Scholar is the golden contract; Scholar-Athlete inherits that
 * canonical record contract and adds its governed athlete projection. Every
 * other role remains resumable but fail-closed until it has equivalent evidence.
 */
export function assertRoleOnboardingCompletionSupported(
  role?: string | null
): SupportedOnboardingCompletionRole {
  const normalized = normalizePlaybookRole(role);
  if (normalized !== "scholar" && normalized !== "scholar-athlete") {
    const definition = getRoleDefinition(normalized);
    throw new Error(
      `${definition.label} onboarding is saved but cannot be completed until its governed role adapter is connected.`
    );
  }
  return normalized;
}
