import { Resend } from "resend";

type SendStartingFiveInviteInput = {
  invitedEmail: string;
  supporterName: string;
  scholarName: string;
  supporterRole: string;
  claimUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendStartingFiveInvite({
  invitedEmail,
  supporterName,
  scholarName,
  supporterRole,
  claimUrl,
}: SendStartingFiveInviteInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.PLAYBOOK_INVITE_FROM ??
    "Playbook Series <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  const resend = new Resend(apiKey);

  const safeSupporterName = escapeHtml(supporterName);
  const safeScholarName = escapeHtml(scholarName);
  const safeRole = escapeHtml(supporterRole);
  const safeClaimUrl = escapeHtml(claimUrl);

  const { data, error } = await resend.emails.send({
    from,
    to: [invitedEmail],
    subject: `${scholarName} invited you to join their Starting Five`,
    html: `
      <div style="background:#f5f1e8;padding:40px 16px;font-family:Arial,sans-serif;color:#18251f">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ded8ca">
          <div style="background:#18382d;padding:34px;text-align:center">
            <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#d8b56b;font-weight:700">
              Playbook Series
            </div>
            <h1 style="margin:12px 0 0;color:#ffffff;font-size:30px;line-height:1.2">
              You have been drafted.
            </h1>
          </div>

          <div style="padding:38px">
            <p style="font-size:18px;margin:0 0 18px">
              Hi ${safeSupporterName},
            </p>

            <p style="font-size:16px;line-height:1.7;margin:0 0 18px">
              <strong>${safeScholarName}</strong> invited you to join their
              <strong>Starting Five</strong> as their
              <strong>${safeRole}</strong>.
            </p>

            <p style="font-size:16px;line-height:1.7;margin:0 0 28px">
              Create your Playbook profile to support their goals, celebrate
              milestones, and stay connected to their journey.
            </p>

            <div style="text-align:center;margin:30px 0">
              <a
                href="${safeClaimUrl}"
                style="display:inline-block;background:#d8b56b;color:#18251f;text-decoration:none;font-weight:800;padding:15px 28px;border-radius:999px"
              >
                Accept My Invitation
              </a>
            </div>

            <p style="font-size:13px;line-height:1.6;color:#66736d;margin:28px 0 8px">
              This secure invitation expires in 7 days.
            </p>

            <p style="font-size:12px;line-height:1.6;color:#66736d;word-break:break-all;margin:0">
              Button not working? Copy this link into your browser:<br />
              ${safeClaimUrl}
            </p>
          </div>
        </div>
      </div>
    `,
    text: [
      `Hi ${supporterName},`,
      "",
      `${scholarName} invited you to join their Starting Five as their ${supporterRole}.`,
      "",
      "Create your Playbook profile using this secure link:",
      claimUrl,
      "",
      "This invitation expires in 7 days.",
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
