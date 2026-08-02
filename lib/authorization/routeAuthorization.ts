import { normalizePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";
import { canRelationship, type Permission, type RelationshipKind } from "@/lib/permissions";

export type AuthenticatedIdentity = { id: string; email?: string | null };
export type AuthorizationProfile = { id: string; role?: string | null; profile_mode?: string | null };
export type ActiveScholarRelationship = {
  scholarId: string;
  supporterId: string | null;
  relationship: RelationshipKind;
  status: "active" | "removed" | "blocked";
  permissions: Permission[];
};

export type RouteAuthorizationDecision =
  | { authorized: true; identity: AuthenticatedIdentity; role: PlaybookRole; scholarId: string; relationship: ActiveScholarRelationship | null }
  | { authorized: false; reason: "unauthenticated" | "profile_missing" | "role_forbidden" | "relationship_required" | "permission_forbidden" };

export function authorizeRouteContext(input: {
  identity: AuthenticatedIdentity | null;
  profile: AuthorizationProfile | null;
  allowedRoles?: readonly PlaybookRole[];
  scholarId?: string | null;
  relationships?: ActiveScholarRelationship[];
  permission?: Permission;
}): RouteAuthorizationDecision {
  if (!input.identity) return { authorized: false, reason: "unauthenticated" };
  if (!input.profile) return { authorized: false, reason: "profile_missing" };

  const role = normalizePlaybookRole(input.profile.profile_mode || input.profile.role);
  if (input.allowedRoles && !input.allowedRoles.includes(role)) {
    return { authorized: false, reason: "role_forbidden" };
  }

  const scholarId = input.scholarId || input.identity.id;
  if (scholarId === input.identity.id) {
    if (input.permission && !canRelationship("scholar", input.permission)) {
      return { authorized: false, reason: "permission_forbidden" };
    }
    return { authorized: true, identity: input.identity, role, scholarId, relationship: null };
  }

  const relationship = (input.relationships || []).find(
    (candidate) => candidate.scholarId === scholarId && candidate.supporterId === input.identity?.id && candidate.status === "active"
  );
  if (!relationship) return { authorized: false, reason: "relationship_required" };
  if (input.permission && (!canRelationship(relationship.relationship, input.permission) || !relationship.permissions.includes(input.permission))) {
    return { authorized: false, reason: "permission_forbidden" };
  }

  return { authorized: true, identity: input.identity, role, scholarId, relationship };
}
