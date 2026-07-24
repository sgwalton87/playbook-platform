import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, skipped: "No RESEND_API_KEY" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Playbook Series Inc. <onboarding@resend.dev>",
      to: ["stephishawalton@gmail.com"],
      subject: `[Playbook Admin] New verification request — ${body.userName || "New user"}`,
      html: `
        <h2>New Playbook Verification Request</h2>
        <p><strong>Name:</strong> ${body.userName || ""}</p>
        <p><strong>Email:</strong> ${body.userEmail || ""}</p>
        <p><strong>Role:</strong> ${body.role || ""}</p>
        <p><strong>.edu Email:</strong> ${body.eduEmail || ""}</p>
        <p><strong>Reason:</strong> ${body.reason || ""}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Notification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
