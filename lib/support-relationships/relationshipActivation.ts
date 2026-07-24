import type { RelationshipKind } from "@/lib/permissions";
import { buildSupportRelationship } from "./supportRelationships";

export function buildAcceptedInvitationRelationship(input: {
  invitation: LegacyValue;
  supporterId?: string | null;
}) {
  return buildSupportRelationship({
    scholarId: input.invitation.scholar_id,
    supporterId: input.supporterId || undefined,
    supporterEmail: input.invitation.invitee_email,
    supporterName: input.invitation.invitee_name,
    relationship: input.invitation.relationship as RelationshipKind,
    sourceInvitationId: input.invitation.id,
  });
}

export function invitationEmailMatchesUser(invitationEmail: string, userEmail?: string | null) {
  if (!userEmail) return false;
  return invitationEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();
}
