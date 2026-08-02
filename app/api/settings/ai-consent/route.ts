import { NextRequest, NextResponse } from "next/server";
import { apiError, readBoundedJson, requireAuthenticatedMutation } from "@/lib/api-security/server";

export async function PUT(request: NextRequest) {
  const boundary = await requireAuthenticatedMutation(request);
  if (!boundary.ok) return boundary.response;
  const input = await readBoundedJson(request, 1_024);
  if (!input.ok) return input.response;
  const body = input.value && typeof input.value === "object" && !Array.isArray(input.value)
    ? input.value as Record<string, unknown>
    : null;
  const status = body?.status;
  if (status !== "granted" && status !== "withdrawn") {
    return apiError("Consent status must be granted or withdrawn.", 422);
  }
  const now = new Date().toISOString();
  const { error } = await boundary.supabase.from("ai_processing_consents").upsert({
    user_id: boundary.user.id,
    status,
    policy_version: "ai-guidance-v1",
    granted_at: status === "granted" ? now : null,
    withdrawn_at: status === "withdrawn" ? now : null,
    updated_at: now,
  }, { onConflict: "user_id" });
  return error
    ? apiError("AI processing consent could not be updated.", 400)
    : NextResponse.json({ ok: true, status });
}
