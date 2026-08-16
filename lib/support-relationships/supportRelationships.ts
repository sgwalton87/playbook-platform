import { getPermissionsForRelationship, type RelationshipKind } from "@/lib/permissions";

export function buildSupportRelationship(input: {
  scholarId: string;
  supporterId?: string;
  supporterEmail: string;
  supporterName?: string;
  relationship: RelationshipKind;
  sourceInvitationId?: string;
}) {
  return {
    scholar_id: input.scholarId,
    supporter_id: input.supporterId || null,
    supporter_email: input.supporterEmail,
    supporter_name: input.supporterName || null,
    relationship: input.relationship,
    permissions: getPermissionsForRelationship(input.relationship),
    source_invitation_id: input.sourceInvitationId || null,
    status: "active",
  };
}
