import { getPermissionsForRelationship, type RelationshipKind } from "@/lib/permissions";
import { getRoleDestination } from "@/lib/role-os/roleRoutes";

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface SupportInvitation {
  id: string;
  scholarId: string;
  scholarName: string;
  inviteeName: string;
  inviteeEmail: string;
  relationship: RelationshipKind;
  status: InvitationStatus;
  permissions: string[];
  destination: string;
}

export function createSupportInvitation(input: {
  scholarId?: string;
  scholarName?: string;
  inviteeName: string;
  inviteeEmail: string;
  relationship: RelationshipKind;
}): SupportInvitation {
  return {
    id: `invite-${input.relationship}-${input.inviteeEmail.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    scholarId: input.scholarId || "scholar-record",
    scholarName: input.scholarName || "Scholar",
    inviteeName: input.inviteeName,
    inviteeEmail: input.inviteeEmail,
    relationship: input.relationship,
    status: "pending",
    permissions: getPermissionsForRelationship(input.relationship),
    destination: destinationForRelationship(input.relationship),
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
    // A generic university relationship does not prove whether the invitee is
    // a recruiter or admissions officer. Keep it at the neutral university
    // boundary until that role is explicitly selected and verified.
    university_partner: "/university-os",
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
