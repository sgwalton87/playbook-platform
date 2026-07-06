import { NextRequest, NextResponse } from "next/server";
import { routeMailToPlaybook, type MailGatewayChannel } from "@/lib/mail-gateway";
import {
  buildSupportMessageRecord,
  suggestActionUpdateFromMessage,
} from "@/lib/support-network-live/server";
import { bridgeMailToConversation } from "@/lib/messages";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const secret = req.headers.get("x-playbook-mail-secret");

  if (process.env.MAIL_GATEWAY_SECRET && secret !== process.env.MAIL_GATEWAY_SECRET) {
    return NextResponse.json({ error: "Unauthorized mail webhook." }, { status: 401 });
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

  const { data: relationship } = await supabase
    .from("support_relationships")
    .select("*")
    .eq("supporter_email", routed.senderEmail)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!relationship) {
    return NextResponse.json({
      ok: true,
      routed,
      persisted: false,
      reason: "No active support relationship found for sender.",
    });
  }

  const messageRecord = buildSupportMessageRecord({
    scholarId: relationship.scholar_id,
    senderId: relationship.supporter_id,
    senderRole: relationship.relationship,
    body: routed.body,
  });

  const { data: message, error } = await supabase
    .from("support_messages")
    .insert(messageRecord)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const suggestedActionUpdate = suggestActionUpdateFromMessage(routed.body);

  const conversationBridge = bridgeMailToConversation({
    scholarId: relationship.scholar_id,
    senderEmail: routed.senderEmail,
    senderRole: relationship.relationship,
    subject: routed.subject,
    body: routed.body,
  });

  return NextResponse.json({
    ok: true,
    routed,
    persisted: true,
    message,
    suggestedActionUpdate,
    conversationBridge,
  });
}
