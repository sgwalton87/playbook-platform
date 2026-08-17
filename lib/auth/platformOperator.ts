export const PLATFORM_OPERATOR_ROLES = ["founder", "admin"] as const;

export function isPlatformOperatorRole(value?: string | null) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return PLATFORM_OPERATOR_ROLES.includes(normalized as (typeof PLATFORM_OPERATOR_ROLES)[number]);
}
