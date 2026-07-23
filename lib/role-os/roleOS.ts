import { getLearnerOSDefinition, type LearnerOSRole } from "@/lib/learner-os";
import { getRoleDashboard } from "./roleDashboards";
import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  type PlaybookRole,
} from "@/lib/roles/registry";

export type PlaybookRoleOS =
  | "learner"
  | "family"
  | "educator"
  | "district"
  | "university"
  | "employer"
  | "mentor";

type CanonicalRoleOS = Exclude<PlaybookRole, "other">;

const LEARNER_ROLES = new Set<CanonicalRoleOS>([
  "scholar",
  "scholar-athlete",
  "transition-youth",
  "athlete-abroad",
]);

export function getRoleOS(inputRole: PlaybookRoleOS | CanonicalRoleOS) {
  const role: CanonicalRoleOS =
    inputRole === "learner"
      ? "scholar"
      : inputRole === "university"
        ? "college-coach"
        : inputRole;
  const registry = PLAYBOOK_ROLES[role];
  const experience = LEARNER_ROLES.has(role)
    ? getLearnerOSDefinition(role as LearnerOSRole)
    : getRoleDashboard(role);

  return {
    role,
    title: registry.osLabel,
    audience: registry.label,
    headline: experience.headline,
    focus: experience.modules.map((module) => module.title),
    primaryAction: `Open ${registry.osLabel}`,
    href: registry.osRoute,
  };
}

export function getAllRoleOS() {
  return PUBLIC_ONBOARDING_ROLES
    .filter((role): role is CanonicalRoleOS => role !== "other")
    .map((role) => getRoleOS(role));
}
