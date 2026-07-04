import type { RelationshipKind } from "@/lib/permissions";

export function buildSupportInvitationEmail(input: {
  inviteeName: string;
  scholarName: string;
  relationship: RelationshipKind;
  url: string;
}) {
  const relationship = input.relationship.replaceAll("_", " ");

  const subject = `${input.scholarName} invited you to join Playbook`;

  const text = `Hi ${input.inviteeName},

${input.scholarName} invited you to join their Playbook support network as ${relationship}.

Accept your invitation:
${input.url}

After accepting, Playbook will route you to the correct OS experience.

If you have questions, reply to this email.

- Playbook Onboarding`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0F172A">
      <h1>${input.scholarName} invited you to Playbook</h1>
      <p>Hi ${input.inviteeName},</p>
      <p><strong>${input.scholarName}</strong> invited you to join their Playbook support network as <strong>${relationship}</strong>.</p>
      <p>
        <a href="${input.url}" style="display:inline-block;background:#F97316;color:white;padding:12px 16px;border-radius:999px;text-decoration:none;font-weight:bold">
          Accept Invitation
        </a>
      </p>
      <p>After accepting, Playbook will route you to the correct OS experience.</p>
      <p>If you have questions, reply to this email.</p>
      <p>- Playbook Onboarding</p>
    </div>
  `;

  return { subject, text, html };
}
