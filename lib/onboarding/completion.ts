import { getRoleDefinition, normalizePlaybookRole } from "@/lib/roles/registry";

/**
 * A role may only be marked complete after its durable execution adapter is
 * connected. Scholar is the current golden contract; every other role remains
 * resumable but fail-closed until it has equivalent evidence.
 */
export function assertRoleOnboardingCompletionSupported(role?: string | null): "scholar" {
  const normalized = normalizePlaybookRole(role);
  if (normalized !== "scholar") {
    const definition = getRoleDefinition(normalized);
    throw new Error(
      `${definition.label} onboarding is saved but cannot be completed until its governed role adapter is connected.`
    );
  }
  return normalized;
}
