import { NextRequest, NextResponse } from "next/server";
import { apiError, consumeApiQuota, readBoundedJson, requireAuthenticatedMutation } from "@/lib/api-security/server";
import { callZaiChat } from "@/lib/zai";
import { beginAIGuidanceRun, finishAIGuidanceRun } from "@/lib/ai/governance";
import { captureOperationalError, emitTelemetry, traceOperation } from "@/lib/observability";

type Input = Record<string, unknown>;

export async function POST(request: NextRequest) {
  const boundary = await requireAuthenticatedMutation(request);
  if (!boundary.ok) return boundary.response;
  const { data: consent } = await boundary.supabase.from("ai_processing_consents")
    .select("status,policy_version").eq("user_id", boundary.user.id).maybeSingle();
  if (consent?.status !== "granted" || consent.policy_version !== "ai-guidance-v1") {
    return apiError("Explicit AI processing consent is required.", 403);
  }
  const quota = await consumeApiQuota(boundary.supabase, "ai.guidance", 10, 3600);
  if (!quota.ok) return quota.response;
  const input = await readBoundedJson(request, 8_192);
  if (!input.ok) return input.response;
  if (!input.value || typeof input.value !== "object" || Array.isArray(input.value)) {
    return apiError("A guidance request is required.", 422);
  }
  const body = input.value as Input;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length < 3 || prompt.length > 2_000) {
    return apiError("Prompt must contain between 3 and 2,000 characters.", 422);
  }
  const runId = await beginAIGuidanceRun(boundary.supabase, prompt);
  if (!runId) return apiError("AI guidance provenance is unavailable.", 503);

  try {
    const result = await traceOperation({ service: "playbook-ai", component: "guidance", operation: "provider_completion", dependency: "zai", context: boundary.telemetry, metadata: { model: "glm-5.2" } }, () => callZaiChat({
      model: "glm-5.2",
      temperature: 0.4,
      timeoutMs: 12_000,
      messages: [
        {
          role: "system",
          content: "You are Playbook AI. Provide concise, student-centered guidance. State uncertainty, never invent personal facts, never promise selection or outcomes, and preserve human decision authority.",
        },
        { role: "user", content: prompt },
      ],
    }));
    const audited = await finishAIGuidanceRun(boundary.supabase, { runId, status: "completed", output: result.text });
    await emitTelemetry({ severity: audited ? "info" : "error", service: "playbook-ai", component: "guidance", operation: "audit_completion", outcome: audited ? "success" : "failure", context: boundary.telemetry, dependency: "supabase-rpc", errorClassification: audited ? undefined : "AiAuditFailed" });
    return audited
      ? NextResponse.json({ ok: true, text: result.text, humanReviewRequired: true })
      : apiError("AI guidance could not be audited and was not returned.", 503);
  } catch (error: unknown) {
    await finishAIGuidanceRun(boundary.supabase, { runId, status: "failed", errorCode: "provider_unavailable" });
    await captureOperationalError(error, { service: "playbook-ai", component: "guidance", operation: "guidance_request", context: boundary.telemetry, dependency: "zai" });
    return apiError("AI guidance is temporarily unavailable. No decision was made for you.", 503);
  }
}
