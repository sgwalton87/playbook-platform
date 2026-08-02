import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { apiError, consumeApiQuota, readBoundedJson, requireAuthenticatedMutation, requireIdempotencyKey } from "@/lib/api-security/server";
import { beginDelivery, finishDelivery } from "@/lib/communications/delivery";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashRecipient = (email: string) => createHash("sha256").update(email.toLowerCase()).digest("hex");
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export async function POST(request: NextRequest) {
  const boundary = await requireAuthenticatedMutation(request);
  if (!boundary.ok) return boundary.response;
  const idempotency = requireIdempotencyKey(request);
  if (!idempotency.ok) return idempotency.response;
  const quota = await consumeApiQuota(boundary.supabase, "notification.guardian_update", 10, 3600);
  if (!quota.ok) return quota.response;
  const input = await readBoundedJson(request, 8_192);
  if (!input.ok) return input.response;
  const body = input.value && typeof input.value === "object" && !Array.isArray(input.value)
    ? input.value as Record<string, unknown>
    : null;
  const relationshipId = typeof body?.relationshipId === "string" ? body.relationshipId.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!uuidPattern.test(relationshipId) || subject.length < 3 || subject.length > 120 || message.length < 10 || message.length > 2_000) {
    return apiError("Relationship, subject, and a bounded guardian message are required.", 422);
  }

  const { data: relationship, error: relationshipError } = await boundary.supabase
    .from("support_relationships")
    .select("id,supporter_email,supporter_name,relationship,status")
    .eq("id", relationshipId).eq("scholar_id", boundary.user.id).eq("status", "active").maybeSingle();
  const relationshipType = typeof relationship?.relationship === "string" ? relationship.relationship.toLowerCase() : "";
  if (relationshipError || !relationship || !["parent", "guardian", "family"].includes(relationshipType)) {
    return apiError("An active guardian relationship is required.", 403);
  }
  const recipient = relationship.supporter_email;
  const sender = process.env.PLAYBOOK_EMAIL_NOTIFICATIONS?.trim() ?? "";
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  if (!emailPattern.test(recipient) || !emailPattern.test(sender) || !apiKey) {
    return apiError("Guardian notification delivery is not configured.", 503);
  }

  const attempt = await beginDelivery(boundary.supabase, {
    commandKey: idempotency.value, purpose: "guardian_update", relationshipId: relationship.id,
    recipientHash: hashRecipient(recipient),
    telemetry: boundary.telemetry,
  });
  if (!attempt.ok) return apiError("Notification delivery audit is unavailable.", 503);
  if (!attempt.created) {
    return NextResponse.json({ ok: attempt.status === "delivered_to_provider", replayed: true, status: attempt.status });
  }

  let providerMessageId: string | null = null;
  let providerFailed = false;
  try {
    const result = await new Resend(apiKey).emails.send({
      from: `Playbook Notifications <${sender}>`, to: [recipient],
      subject: `[Playbook] ${subject}`,
      html: `<p>Hello ${escapeHtml(relationship.supporter_name ?? "Guardian")},</p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p><p>This update was sent through an active Scholar-controlled Playbook relationship.</p>`,
    });
    providerMessageId = result.data?.id ?? null;
    providerFailed = Boolean(result.error);
  } catch {
    providerFailed = true;
  }
  const audited = await finishDelivery(boundary.supabase, {
    attemptId: attempt.attemptId, status: providerFailed ? "failed" : "delivered_to_provider",
    providerMessageId, errorCode: providerFailed ? "provider_rejected" : null,
    telemetry: boundary.telemetry,
  });
  if (!audited) return apiError("Notification delivery could not be audited.", 503);
  return providerFailed
    ? apiError("Guardian notification could not be delivered.", 502)
    : NextResponse.json({ ok: true, acceptedByProvider: true });
}
