import { requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";

export interface AuthCallbackRoleInput {
  existingProfileMode?: unknown;
  existingProfileRole?: unknown;
  verifiedSignupRole?: unknown;
  googleRequestedRole?: unknown;
  metadataProfileMode?: unknown;
  metadataRole?: unknown;
  metadataRequestedRole?: unknown;
}

function roleString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Resolve callback routing from durable profile truth first. Auth user metadata
 * may preserve a newly selected signup pathway, but it never overrides an
 * existing profile and it never grants downstream role authority by itself.
 */
export function resolveAuthCallbackRole(input: AuthCallbackRoleInput): PlaybookRole {
  const candidate =
    roleString(input.existingProfileMode) ??
    roleString(input.existingProfileRole) ??
    roleString(input.verifiedSignupRole) ??
    roleString(input.googleRequestedRole) ??
    roleString(input.metadataProfileMode) ??
    roleString(input.metadataRole) ??
    roleString(input.metadataRequestedRole);

  return requirePlaybookRole(candidate);
}
