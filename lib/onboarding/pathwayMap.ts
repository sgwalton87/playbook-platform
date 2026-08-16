import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  getRoleDefinition,
  requirePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";

export type { PlaybookRole } from "@/lib/roles/registry";

export const PLAYBOOK_PATHWAYS = PUBLIC_ONBOARDING_ROLES.map((role) => ({
  role,
  label: PLAYBOOK_ROLES[role].label,
  osRoute: PLAYBOOK_ROLES[role].osRoute,
}));

function resolvePathwayRole(role?: string | null): PlaybookRole {
  if (role === undefined || role === null || String(role).trim() === "") {
    return "scholar";
  }
  return requirePlaybookRole(role);
}

export function normalizeRole(role?: string | null): PlaybookRole {
  return resolvePathwayRole(role);
}

export function getPathway(role?: string | null) {
  const normalized = resolvePathwayRole(role);
  const definition = getRoleDefinition(normalized);
  return { role: normalized, label: definition.label, osRoute: definition.osRoute };
}
