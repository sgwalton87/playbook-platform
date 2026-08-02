import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { apiError, consumeApiQuota, readBoundedJson, requireAuthenticatedMutation, requireIdempotencyKey } from "@/lib/api-security/server";
import { beginDelivery, finishDelivery } from "@/lib/communications/delivery";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashRecipient = (email: string) => createHash("sha256").update(email.toLowerCase()).digest("hex");
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export async function POST(request: NextRequest) {
  const boundary = await requireAuthenticatedMutation(request);
  if (!boundary.ok) return boundary.response;
  const idempotency = requireIdempotencyKey(request);
  if (!idempotency.ok) return idempotency.response;
  const quota = await consumeApiQuota(boundary.supabase, "notification.admin_verification", 3, 3600);
  if (!quota.ok) return quota.response;
  const input = await readBoundedJson(request, 4_096);
  if (!input.ok) return input.response;
  const body = input.value && typeof input.value === "object" && !Array.isArray(input.value)
    ? input.value as Record<string, unknown>
    : null;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 10 || reason.length > 1_000) {
    return apiError("Verification reason must contain between 10 and 1,000 characters.", 422);
  }

  const recipient = process.env.PLAYBOOK_ADMIN_NOTIFICATION_EMAIL?.trim() ?? "";
  const sender = process.env.PLAYBOOK_EMAIL_NOTIFICATIONS?.trim() ?? "";
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  if (!emailPattern.test(recipient) || !emailPattern.test(sender) || !apiKey) {
    return apiError("Administrative notification delivery is not configured.", 503);
  }
  const { data: profile } = await boundary.supabase.from("profiles")
    .select("full_name,requested_role,role,email")
    .eq("id", boundary.user.id)
    .maybeSingle();
  const name = typeof profile?.full_name === "string" ? profile.full_name : "Playbook member";
  const role = typeof profile?.requested_role === "string" ? profile.requested_role : String(profile?.role ?? "not selected");
  const actorEmail = boundary.user.email ?? (typeof profile?.email === "string" ? profile.email : "unavailable");

  const attempt = await beginDelivery(boundary.supabase, {
    commandKey: idempotency.value, purpose: "admin_verification", relationshipId: null,
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
      subject: "[Playbook] Verification review requested",
      html: `<h2>Verification review requested</h2><p><strong>Member:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(actorEmail)}</p><p><strong>Requested role:</strong> ${escapeHtml(role)}</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p>`,
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
    ? apiError("Administrative notification could not be delivered.", 502)
    : NextResponse.json({ ok: true, acceptedByProvider: true });
}
