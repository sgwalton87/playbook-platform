import { applyInvitationStatus } from "./invitationLifecycle";
import { buildAcceptedInvitationRelationship } from "@/lib/support-relationships";
import { buildSupportMessageRecord } from "@/lib/support-network-live/server";

type AcceptedInvitation = {
  id: string;
  scholar_id: string;
  scholar_name?: string | null;
  invitee_name: string;
  invitee_email: string;
  relationship: string;
};

export const ACCEPTANCE_WELCOME_MESSAGE =
  "I’m here to support you—thanks for inviting me to your Playbook.";

export function buildInvitationAcceptanceEffects(input: {
  invitation: AcceptedInvitation;
  supporterId: string;
}) {
  const { invitation, supporterId } = input;
  const detail = `${invitation.invitee_name} joined your Playbook Support Network.`;

  return {
    relationship: buildAcceptedInvitationRelationship({ invitation, supporterId }),
    message: {
      id: invitation.id,
      ...buildSupportMessageRecord({
        scholarId: invitation.scholar_id,
        senderId: supporterId,
        senderRole: invitation.relationship,
        body: ACCEPTANCE_WELCOME_MESSAGE,
      }),
    },
    event: {
      id: invitation.id,
      type: "invitation.accepted",
      scholar_id: invitation.scholar_id,
      actor_id: supporterId,
      actor_role: invitation.relationship,
      payload: {
        title: "Support invitation accepted",
        detail,
        invitation_id: invitation.id,
      },
    },
    notification: {
      id: invitation.id,
      user_id: invitation.scholar_id,
      scholar_id: invitation.scholar_id,
      type: "invitation",
      title: `${invitation.invitee_name} joined your Playbook`,
      body: detail,
      href: "/support-network",
      priority: "medium",
      read: false,
      delivery_status: "in_app",
      source_event_id: invitation.id,
    },
    invitationUpdate: applyInvitationStatus("accepted"),
  };
}
