import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type NotifyAdminPayload = {
  userName?: string;
  userEmail?: string;
  role?: string;
  eduEmail?: string;
  reason?: string;
};

function escapeHtml(value: string | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown notification error";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NotifyAdminPayload;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json({ success: true, skipped: "No RESEND_API_KEY" });
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: "Playbook Series Inc. <onboarding@resend.dev>",
      to: ["stephishawalton@gmail.com"],
      subject: `[Playbook Admin] New verification request — ${body.userName || "New user"}`,
      html: `
        <h2>New Playbook Verification Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(body.userName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(body.userEmail)}</p>
        <p><strong>Role:</strong> ${escapeHtml(body.role)}</p>
        <p><strong>.edu Email:</strong> ${escapeHtml(body.eduEmail)}</p>
        <p><strong>Reason:</strong> ${escapeHtml(body.reason)}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
