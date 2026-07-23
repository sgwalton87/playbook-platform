import type { PlaybookRole } from "@/lib/roles/registry";

export type GovernedResource =
  | "own_profile"
  | "learner_record"
  | "support_network"
  | "messages"
  | "academic_readiness"
  | "cohort"
  | "opportunities"
  | "institutional_outreach"
  | "system_equity"
  | "founder_admin";

export type GovernedAction =
  | "read"
  | "create"
  | "update"
  | "verify"
  | "invite"
  | "message"
  | "manage";

export type AuthorizationContext = {
  isOwner?: boolean;
  hasActiveRelationship?: boolean;
  hasExplicitShare?: boolean;
  institutionalScope?: boolean;
  isFounder?: boolean;
};

const LEARNER_ROLES = new Set<PlaybookRole>([
  "scholar",
  "scholar-athlete",
  "transition-youth",
  "athlete-abroad",
]);

const SUPPORT_ROLES = new Set<PlaybookRole>(["family", "mentor"]);
const K12_ROLES = new Set<PlaybookRole>(["educator", "counselor", "coach"]);
const COLLEGE_ROLES = new Set<PlaybookRole>(["college-coach", "college-admissions"]);
const OPPORTUNITY_ROLES = new Set<PlaybookRole>(["brand-partner", "employer"]);

export function authorizeRole(input: {
  role: PlaybookRole;
  resource: GovernedResource;
  action: GovernedAction;
  context?: AuthorizationContext;
}) {
  const { role, resource, action, context = {} } = input;

  if (resource === "founder_admin") return Boolean(context.isFounder);
  if (resource === "own_profile") return Boolean(context.isOwner);

  if (LEARNER_ROLES.has(role)) {
    if (resource === "learner_record" || resource === "academic_readiness") {
      return Boolean(context.isOwner);
    }
    if (resource === "support_network") {
      return Boolean(context.isOwner) && ["read", "invite", "manage"].includes(action);
    }
    if (resource === "messages") {
      return Boolean(context.isOwner || context.hasActiveRelationship);
    }
    if (resource === "opportunities") return ["read", "create"].includes(action);
  }

  if (SUPPORT_ROLES.has(role)) {
    if (["learner_record", "academic_readiness", "support_network"].includes(resource)) {
      return Boolean(context.hasActiveRelationship && context.hasExplicitShare);
    }
    if (resource === "messages") return Boolean(context.hasActiveRelationship);
    if (resource === "opportunities") return action === "read";
  }

  if (K12_ROLES.has(role)) {
    if (resource === "messages") return Boolean(context.hasActiveRelationship);
    if (["learner_record", "academic_readiness"].includes(resource)) {
      return Boolean(context.institutionalScope && context.hasExplicitShare);
    }
    if (resource === "cohort") return Boolean(context.institutionalScope);
    if (resource === "opportunities") return ["read", "create"].includes(action);
  }

  if (role === "district") {
    if (resource === "system_equity" || resource === "cohort") {
      return Boolean(context.institutionalScope && ["read", "manage"].includes(action));
    }
    if (resource === "learner_record") return false;
    if (resource === "messages") return Boolean(context.hasActiveRelationship);
  }

  if (COLLEGE_ROLES.has(role)) {
    if (resource === "learner_record") {
      return Boolean(context.hasExplicitShare && action === "read");
    }
    if (resource === "institutional_outreach") {
      return Boolean(context.institutionalScope && ["read", "create", "manage"].includes(action));
    }
    if (resource === "messages") return Boolean(context.hasActiveRelationship);
    if (resource === "opportunities") return ["read", "create"].includes(action);
  }

  if (OPPORTUNITY_ROLES.has(role)) {
    if (resource === "learner_record") {
      return Boolean(context.hasExplicitShare && action === "read");
    }
    if (resource === "opportunities") {
      return Boolean(context.institutionalScope && ["read", "create", "manage"].includes(action));
    }
    if (resource === "messages") return Boolean(context.hasActiveRelationship);
  }

  return false;
}
