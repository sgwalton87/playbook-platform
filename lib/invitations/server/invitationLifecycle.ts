import crypto from "crypto";

import {
  createSupportInvitation,
  type InvitationStatus,
} from "@/lib/invitations";

import type { RelationshipKind } from "@/lib/permissions";

export function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function buildInvitationRecord(input: {
  scholarId: string;
  scholarName: string;
  inviteeName: string;
  inviteeEmail: string;
  relationship: RelationshipKind;
  invitedRole?: string | null;
}) {
  const base = createSupportInvitation(input);

  return {
    ...base,
    id: crypto.randomUUID(),
    scholarId: input.scholarId,
    scholarName: input.scholarName,
    token: generateInviteToken(),
    destination: base.destination,
    invitedRole: base.invitedRole,
  };
}

export function buildInvitationEmail(input: {
  inviteeName: string;
  scholarName: string;
  relationship: RelationshipKind;
  token: string;
  origin?: string;
}) {
  const origin = input.origin || "http://localhost:3000";

  const url = `${origin}/invite/${input.token}`;

  return {
    subject: `${input.scholarName} invited you to Playbook`,

    body: `Hi ${input.inviteeName},

${input.scholarName} invited you to join their Playbook support network as ${input.relationship.replaceAll("_", " ")}.

Accept your invitation here:

${url}

After accepting, Playbook will guide you through onboarding for your invited role. Your support-network connection activates after onboarding is complete.

- Playbook`,

    url,
  };
}

export function applyInvitationStatus(
  status: InvitationStatus
) {
  const now = new Date().toISOString();

  if (status === "accepted") {
    return {
      status,
      accepted_at: now,
      declined_at: null,
    };
  }

  if (status === "declined") {
    return {
      status,
      accepted_at: null,
      declined_at: now,
    };
  }

  return {
    status,
    accepted_at: null,
    declined_at: null,
  };
}
