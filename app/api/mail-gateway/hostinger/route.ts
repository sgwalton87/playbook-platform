import { NextRequest, NextResponse } from "next/server";
import { routeMailToPlaybook, type MailGatewayChannel } from "@/lib/mail-gateway";
import { suggestActionUpdateFromMessage } from "@/lib/support-network-live/server";
import { bridgeMailToConversation } from "@/lib/messages";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-playbook-mail-secret");
  if (!process.env.MAIL_GATEWAY_SECRET) return NextResponse.json({ error: "Mail gateway is not configured." }, { status: 503 });
  if (secret !== process.env.MAIL_GATEWAY_SECRET) return NextResponse.json({ error: "Unauthorized mail webhook." }, { status: 401 });
  const body = await request.json();
  if (!body.messageId || !body.from || !body.to) return NextResponse.json({ error: "Provider message identity, sender, and recipient are required." }, { status: 422 });
  const routed = routeMailToPlaybook({ mailbox: (body.mailbox || "support") as MailGatewayChannel, from: body.from, to: body.to, subject: body.subject || "", text: body.text || body.body || "", messageId: body.messageId });
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("ingest_support_mail", { p_message_id: routed.id, p_sender_email: routed.senderEmail, p_body: routed.body });
  if (error) return NextResponse.json({ error: "Inbound message could not be persisted." }, { status: 400 });
  const result = data as { persisted: boolean; duplicate?: boolean; scholarId?: string; senderRole?: string; reason?: string };
  return NextResponse.json({ ok: true, routed, ...result, suggestedActionUpdate: result.persisted ? suggestActionUpdateFromMessage(routed.body) : null, conversationBridge: result.persisted && result.scholarId ? bridgeMailToConversation({ scholarId: result.scholarId, senderEmail: routed.senderEmail, senderRole: result.senderRole || "supporter", subject: routed.subject, body: routed.body }) : null });
}
