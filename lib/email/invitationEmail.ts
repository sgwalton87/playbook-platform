import type { RelationshipKind } from "@/lib/permissions";

// Escape member-entered strings before including them in HTML emails.
const safe = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const nameOf = (kind: RelationshipKind) => kind.replaceAll("_", " ").replace(/\\b\\w/g, c => c.toUpperCase());
const frame = (eyebrow: string, title: string, body: string, buttonLabel: string, url: string) => `
<div style="margin:0;padding:36px 12px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#11213c">
 <div style="max-width:610px;margin:auto;background:white;border-radius:22px;overflow:hidden;border:1px solid #dce4ef">
  <div style="background:#081d39;padding:30px;color:white;border-bottom:5px solid #f97316">
   <p style="font-size:12px;letter-spacing:3px;font-weight:800;color:#ffb17c;margin:0 0 12px">THE PLAYBOOK · RUN IT</p>
   <h1 style="font-size:30px;line-height:1.2;margin:0;color:white">${title}</h1>
  </div>
  <div style="padding:30px">
   <p style="color:#b94e17;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase">${eyebrow}</p>
   ${body}
   <p style="margin:28px 0"><a href="${safe(url)}" style="background:#ec5b13;color:white;text-decoration:none;font-size:16px;font-weight:800;padding:16px 24px;border-radius:12px;display:inline-block">${buttonLabel} →</a></p>
   <p style="font-size:13px;color:#58667c;line-height:1.7">If the button does not open, paste this address into your browser:<br/><span style="word-break:break-all">${safe(url)}</span></p>
  </div>
  <div style="padding:18px 30px;background:#ecf2f8;color:#475569;font-size:12px;line-height:1.6">
   A Playbook invitation never transfers ownership of a Scholar Record. Access starts only after exact-email acceptance and any required verification. Do not forward private invitation links or codes.
  </div>
 </div>
</div>`;

export function buildSupportInvitationEmail(input: {
  inviteeName: string;
  scholarName: string;
  relationship: RelationshipKind;
  url: string;
  inviteCode?: string;
}) {
  const role = nameOf(input.relationship);
  const code = input.inviteCode || "";
  const subject = `Your Playbook invitation from ${input.scholarName} · ${role}`;
  const text = `You're on the team!\\n\\nHi ${input.inviteeName},\\n\\n${input.scholarName} invited you to join their Playbook Support Network as ${role}.\\n\\nReview and accept: ${input.url}\\n${code ? `Invitation code: ${code}\\nEnter it at https://app.playbookseriesinc.org/invitations/received\\n` : ""}\\nSign in with the exact invited email. Your account type must match the proposed relationship; some relationships require additional verification.\\n\\nPlaybook Support`;
  const body = `<p style="font-size:19px;line-height:1.5">Hey ${safe(input.inviteeName)},</p>
   <p style="font-size:16px;line-height:1.7"><strong>${safe(input.scholarName)}</strong> wants you on their team as <strong>${safe(role)}</strong>.</p>
   <p style="font-size:16px;line-height:1.7">Your next play: sign in with the exact invited email, review the proposed relationship, and accept the invitation. Your Scholar's record remains theirs.</p>
   ${code ? `<div style="padding:18px;background:#fff6ed;border:1px solid #f9c89a;border-radius:12px;margin-top:20px"><p style="font-size:12px;letter-spacing:2px;font-weight:800;margin:0 0 8px">YOUR PRIVATE INVITE CODE</p><strong style="font-family:monospace;font-size:25px;letter-spacing:2px">${safe(code)}</strong><p style="font-size:13px;margin-bottom:0">You can enter this code in Playbook's invitation inbox if the button doesn't work.</p></div>` : ""}`;
  return { subject, text, html: frame("A new connection", "You're invited to the team.", body, "Review my invitation", input.url) };
}

export function buildScholarInvitationReceipt(input: {
 scholarName: string; inviteeName: string; relationship: RelationshipKind; inviteeEmail: string; url: string; inviteCode: string;
}) {
 const role=nameOf(input.relationship);
 const subject=`Playbook confirmation · Invitation created for ${input.inviteeName}`;
 const text=`Hi ${input.scholarName},\\n\\nYour ${role} invitation for ${input.inviteeName} (${input.inviteeEmail}) was created.\\nCode: ${input.inviteCode}\\nPrivate invitation: ${input.url}\\n\\nThe connection stays pending until acceptance and required verification. An invitation email may still fail delivery.\\n\\nPlaybook Support`;
 const body=`<p style="font-size:19px">Great move, ${safe(input.scholarName)}.</p>
 <p>You created a <strong>${safe(role)}</strong> invitation for <strong>${safe(input.inviteeName)}</strong> (<span style="word-break:break-all">${safe(input.inviteeEmail)}</span>).</p>
 <p>Invite code: <strong style="font-family:monospace;letter-spacing:2px">${safe(input.inviteCode)}</strong></p>
 <p style="color:#475569">Status: <strong>Pending acceptance.</strong> No supporter can access your record or message you until your relationship is governed and active.</p>`;
 return {subject,text,html:frame("Scholar invitation receipt","Your support team is growing.",body,"Manage invitations", "https://app.playbookseriesinc.org/invitations")};
}
