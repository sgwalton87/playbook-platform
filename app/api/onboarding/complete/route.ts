import { NextRequest, NextResponse } from "next/server";
import { buildCompletionSuccess, validateCompletionPayload, type OnboardingCompletionFailure } from "@/lib/onboarding";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTelemetryContext, emitTelemetry, incrementMetric } from "@/lib/observability";

export async function POST(request: NextRequest) {
  const telemetry = createTelemetryContext(request.headers, { route: "/api/onboarding/complete", feature: "onboarding" });
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    incrementMetric("auth_failure_total");
    await emitTelemetry({ severity: "warn", service: "playbook-api", component: "onboarding", operation: "complete_onboarding", outcome: "denied", context: telemetry, errorClassification: "AuthenticationRequired" });
    const failure: OnboardingCompletionFailure = { ok: false, stage: "authentication", code: "authentication_required", message: "Sign in is required." };
    return NextResponse.json(failure, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const validation = validateCompletionPayload(payload);
  if (validation) return NextResponse.json(validation, { status: 422 });

  const { data, error } = await supabase.rpc("complete_onboarding", { p_profile: payload });
  if (error || !data) {
    incrementMetric("database_rpc_failure_total");
    await emitTelemetry({ severity: "error", service: "playbook-api", component: "onboarding", operation: "complete_onboarding", outcome: "failure", context: { ...telemetry, authenticated: true }, errorClassification: "OnboardingPersistenceFailed", dependency: "supabase-rpc", metadata: { code: error?.code || "completion_failed" } });
    const code = error?.code || "completion_failed";
    await supabase.from("onboarding_completion_attempts").insert({ profile_id: auth.user.id, status: "failed", failed_stage: "persistence", error_code: code });
    const failure: OnboardingCompletionFailure = { ok: false, stage: "persistence", code, message: "Onboarding was not completed. Your existing progress is unchanged." };
    return NextResponse.json(failure, { status: 409 });
  }

  incrementMetric("onboarding_completion_total");
  incrementMetric("scholar_record_creation_total");
  await emitTelemetry({ severity: "info", service: "playbook-api", component: "onboarding", operation: "complete_onboarding", outcome: "success", context: { ...telemetry, authenticated: true } });
  return NextResponse.json(buildCompletionSuccess(data));
}
