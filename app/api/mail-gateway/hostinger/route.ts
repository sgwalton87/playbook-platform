import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { routeMailToPlaybook, type MailGatewayChannel } from "@/lib/mail-gateway";
import { suggestActionUpdateFromMessage } from "@/lib/support-network-live/server";
import { bridgeMailToConversation } from "@/lib/messages";
import { createClient } from "@supabase/supabase-js";

const MAX_TEXT_LENGTH = 5000;

type MailGatewayBody = {
  mailbox?: MailGatewayChannel | string;
  from?: unknown;
  to?: unknown;
  subject?: unknown;
  text?: unknown;
  body?: unknown;
  messageId?: unknown;
};

function normalizeMailGatewayChannel(value: unknown): MailGatewayChannel {
  if (value === "onboarding" || value === "support" || value === "notifications" || value === "hello" || value === "noreply") {
    return value;
  }

  return "support";
}

function sanitizeString(value: unknown, limit: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, limit);
}

function sanitizeEmail(value: unknown): string | null {
  const email = sanitizeString(value, 254);
  if (!email || !email.includes("@")) {
    return null;
  }

  return email.toLowerCase();
}

function verifyWebhookSecret(secret: string | null): boolean {
  const expected = process.env.MAIL_GATEWAY_SECRET;
  if (!expected) {
    return false;
  }

  if (typeof secret !== "string") {
    return false;
  }

  if (secret.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type MailIngestResult = {
  ok: boolean;
  persisted?: boolean;
  reason?: string;
  message?: unknown;
  scholar_id?: string;
  sender_role?: string;
};

export async function POST(req: NextRequest) {
  if (!verifyWebhookSecret(req.headers.get("x-playbook-mail-secret"))) {
    return NextResponse.json({ error: "Unauthorized mail webhook." }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  let body: MailGatewayBody;
  try {
    body = (await req.json()) as MailGatewayBody;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const from = sanitizeEmail(body.from);
  const to = sanitizeEmail(body.to);
  const subject = sanitizeString(body.subject, 240) || "";
  const text = sanitizeString(body.text || body.body, MAX_TEXT_LENGTH) || "";

  if (!from || !to || !text) {
    return NextResponse.json({ error: "Invalid webhook email fields." }, { status: 400 });
  }

  const routed = routeMailToPlaybook({
    mailbox: normalizeMailGatewayChannel(body.mailbox),
    from,
    to,
    subject,
    text,
    messageId: sanitizeString(body.messageId, 128) || undefined,
  });

  const { data: ingestResult, error: ingestError } = await supabase.rpc(
    "ingest_mail_support_message",
    {
      p_sender_email: from,
      p_subject: subject,
      p_body: routed.body,
      p_message_id: sanitizeString(body.messageId, 128),
    },
  );

  if (ingestError) {
    return NextResponse.json({ error: ingestError.message }, { status: 500 });
  }

  const result = ingestResult as MailIngestResult | null;
  if (!result) {
    return NextResponse.json(
      { ok: false, reason: "Mail ingestion response missing." },
      { status: 500 },
    );
  }

  if (result.ok === false) {
    return NextResponse.json({
      ok: false,
      reason: result.reason || "Mail ingestion rejected.",
    }, { status: 400 });
  }

  if (result.persisted !== true) {
    return NextResponse.json({
      ok: true,
      routed,
      persisted: false,
      reason: result.reason || "No active support relationship found for sender.",
    });
  }

  const suggestedActionUpdate = suggestActionUpdateFromMessage(routed.body);

  const conversationBridge = bridgeMailToConversation({
    scholarId: result.scholar_id || "",
    senderEmail: routed.senderEmail,
    senderRole: result.sender_role || "supporter",
    subject: routed.subject,
    body: routed.body,
  });

  return NextResponse.json({
    ok: true,
    routed,
    persisted: true,
    message: result.message,
    suggestedActionUpdate,
    conversationBridge,
  });
}
