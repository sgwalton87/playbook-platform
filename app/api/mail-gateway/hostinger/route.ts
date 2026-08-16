import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { routeMailToPlaybook, type MailGatewayChannel } from "@/lib/mail-gateway";
import {
  buildSupportMessageRecord,
  suggestActionUpdateFromMessage,
} from "@/lib/support-network-live/server";
import { bridgeMailToConversation } from "@/lib/messages";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Mail gateway database configuration is unavailable.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function validSecret(provided: string | null, expected: string) {
  if (!provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.MAIL_GATEWAY_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Mail gateway is disabled because webhook authentication is not configured." }, { status: 503 });
  }
  if (!validSecret(req.headers.get("x-playbook-mail-secret"), expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized mail webhook." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json() as Record<string, unknown>;
    const messageId = String(body.messageId ?? "").trim();
    if (!messageId) {
      return NextResponse.json({ error: "Provider message ID is required for replay protection." }, { status: 400 });
    }

    const routed = routeMailToPlaybook({
      mailbox: String(body.mailbox || "support") as MailGatewayChannel,
      from: String(body.from ?? ""),
      to: String(body.to ?? ""),
      subject: String(body.subject || ""),
      text: String(body.text || body.body || ""),
      messageId,
    });

    const existing = await supabase
      .from("support_messages")
      .select("id,scholar_id,sender_id,sender_role,body,created_at,source_message_id")
      .eq("source_message_id", messageId)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) {
      return NextResponse.json({ ok: true, routed, persisted: true, duplicate: true, message: existing.data });
    }

    const relationships = await supabase
      .from("support_relationships")
      .select("id,scholar_id,supporter_id,supporter_email,relationship,status")
      .eq("supporter_email", routed.senderEmail)
      .eq("status", "active");
    if (relationships.error) throw new Error(relationships.error.message);

    const candidates = relationships.data ?? [];
    if (candidates.length === 0) {
      return NextResponse.json({
        ok: true,
        routed,
        persisted: false,
        reason: "No active support relationship found for sender.",
      });
    }
    if (candidates.length !== 1) {
      return NextResponse.json({
        ok: true,
        routed,
        persisted: false,
        reason: "Sender belongs to multiple active Scholar support networks; deterministic Scholar context is required.",
      }, { status: 202 });
    }

    const relationship = candidates[0];
    const messageRecord = buildSupportMessageRecord({
      scholarId: relationship.scholar_id,
      senderId: relationship.supporter_id,
      senderRole: relationship.relationship,
      body: routed.body,
    });

    const { data: message, error } = await supabase
      .from("support_messages")
      .insert({
        ...messageRecord,
        source_message_id: messageId,
        source_channel: "hostinger",
      })
      .select("id,scholar_id,sender_id,sender_role,body,created_at,source_message_id,source_channel")
      .single();
    if (error) {
      if (error.code === "23505") {
        const duplicate = await supabase
          .from("support_messages")
          .select("id,scholar_id,sender_id,sender_role,body,created_at,source_message_id,source_channel")
          .eq("source_message_id", messageId)
          .single();
        if (!duplicate.error) return NextResponse.json({ ok: true, routed, persisted: true, duplicate: true, message: duplicate.data });
      }
      throw new Error(error.message);
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
      duplicate: false,
      message,
      suggestedActionUpdate,
      conversationBridge,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to ingest mail gateway message." }, { status: 400 });
  }
}
