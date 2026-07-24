import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  getRoleDefinition,
  normalizePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";

export type { PlaybookRole } from "@/lib/roles/registry";

export const PLAYBOOK_PATHWAYS = PUBLIC_ONBOARDING_ROLES.map((role) => ({
  role,
  label: PLAYBOOK_ROLES[role].label,
  osRoute: PLAYBOOK_ROLES[role].osRoute,
}));

export function normalizeRole(role?: string | null): PlaybookRole {
  return normalizePlaybookRole(role);
}

export function getPathway(role?: string | null) {
  const normalized = normalizePlaybookRole(role);
  const definition = getRoleDefinition(normalized);
  return { role: normalized, label: definition.label, osRoute: definition.osRoute };
}
