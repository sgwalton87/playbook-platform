import { getPermissionsForRelationship, type RelationshipKind } from "@/lib/permissions";
import { getRoleDestination } from "@/lib/role-os/roleRoutes";
import { normalizePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface SupportInvitation {
  id: string;
  scholarId: string;
  scholarName: string;
  inviteeName: string;
  inviteeEmail: string;
  relationship: RelationshipKind;
  invitedRole?: PlaybookRole;
  status: InvitationStatus;
  permissions: string[];
  destination: string;
}

const SUPPORT_ROLES_BY_RELATIONSHIP: Record<RelationshipKind, readonly PlaybookRole[]> = {
  scholar: ["scholar"],
  parent_guardian: ["family"],
  educator: ["educator", "counselor", "coach"],
  mentor: ["mentor"],
  district_admin: ["district"],
  university_partner: ["college-coach", "college-admissions"],
  employer_partner: ["employer"],
};

export function roleForSupportInvitation(
  relationship: RelationshipKind,
  requestedRole?: string | null,
): PlaybookRole {
  const allowed = SUPPORT_ROLES_BY_RELATIONSHIP[relationship];
  const normalized = normalizePlaybookRole(requestedRole);
  return allowed.includes(normalized) ? normalized : allowed[0];
}

export function onboardingDestinationForInvitation(input: {
  token: string;
  relationship: RelationshipKind;
  invitedRole?: string | null;
}) {
  const role = roleForSupportInvitation(input.relationship, input.invitedRole);
  return `/start?role=${encodeURIComponent(role)}&first=1&invite=${encodeURIComponent(input.token)}`;
}

export function requiresInvitationRoleOnboarding(input: {
  onboardingCompleted?: boolean | null;
  profileRole?: string | null;
  invitedRole: PlaybookRole;
}) {
  return (
    !input.onboardingCompleted ||
    normalizePlaybookRole(input.profileRole) !== input.invitedRole
  );
}

export function createSupportInvitation(input: {
  scholarId?: string;
  scholarName?: string;
  inviteeName: string;
  inviteeEmail: string;
  relationship: RelationshipKind;
  invitedRole?: string | null;
}): SupportInvitation {
  const invitedRole = roleForSupportInvitation(input.relationship, input.invitedRole);
  return {
    id: `invite-${input.relationship}-${input.inviteeEmail.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    scholarId: input.scholarId || "scholar-maya",
    scholarName: input.scholarName || "Maya Johnson",
    inviteeName: input.inviteeName,
    inviteeEmail: input.inviteeEmail,
    relationship: input.relationship,
    invitedRole,
    status: "pending",
    permissions: getPermissionsForRelationship(input.relationship),
    destination: getRoleDestination(invitedRole),
  };
}

export function updateInvitationStatus(
  invitation: SupportInvitation,
  status: InvitationStatus
): SupportInvitation {
  return {
    ...invitation,
    status,
  };
}

export function destinationForRelationship(relationship: RelationshipKind) {
  const map: Record<RelationshipKind, string> = {
    scholar: getRoleDestination("scholar"),
    parent_guardian: getRoleDestination("family"),
    educator: getRoleDestination("educator"),
    mentor: getRoleDestination("mentor"),
    district_admin: getRoleDestination("district"),
    university_partner: getRoleDestination("university"),
    employer_partner: getRoleDestination("employer"),
  };

  return map[relationship];
}

export function getDemoInvitations() {
  return [
    createSupportInvitation({
      inviteeName: "Parent / Guardian",
      inviteeEmail: "family@example.com",
      relationship: "parent_guardian",
    }),
    updateInvitationStatus(
      createSupportInvitation({
        inviteeName: "Coach Taylor",
        inviteeEmail: "mentor@example.com",
        relationship: "mentor",
      }),
      "accepted"
    ),
    updateInvitationStatus(
      createSupportInvitation({
        inviteeName: "University Outreach",
        inviteeEmail: "university@example.com",
        relationship: "university_partner",
      }),
      "declined"
    ),
  ];
}
