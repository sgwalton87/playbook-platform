import { NextRequest, NextResponse } from "next/server";
import { routeMailToPlaybook, type MailGatewayChannel } from "@/lib/mail-gateway";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-playbook-mail-secret");

  if (
    process.env.MAIL_GATEWAY_SECRET &&
    secret !== process.env.MAIL_GATEWAY_SECRET
  ) {
    return NextResponse.json(
      { error: "Unauthorized mail webhook." },
      { status: 401 }
    );
  }

  const body = await req.json();

  const routed = routeMailToPlaybook({
    mailbox: (body.mailbox || "support") as MailGatewayChannel,
    from: body.from,
    to: body.to,
    subject: body.subject || "",
    text: body.text || body.body || "",
    messageId: body.messageId,
  });

  // Foundation only:
  // Next sprint persists this to support_messages/shared_actions
  // after relationship validation.

  return NextResponse.json({
    ok: true,
    routed,
  });
}
