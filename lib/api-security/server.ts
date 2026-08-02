import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTelemetryContext, emitTelemetry, incrementMetric, observeApiLatency } from "@/lib/observability";

export type ApiBoundaryFailure = {
  ok: false;
  response: NextResponse;
};

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function requireSameOrigin(request: NextRequest): ApiBoundaryFailure | { ok: true } {
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([request.nextUrl.origin]);
  const configuredOrigin = process.env.PLAYBOOK_APP_URL?.trim();

  if (configuredOrigin) {
    try {
      allowedOrigins.add(new URL(configuredOrigin).origin);
    } catch {
      return { ok: false, response: apiError("The application origin is unavailable.", 503) };
    }
  }

  if (!origin || !allowedOrigins.has(origin)) {
    incrementMetric("api_error_total");
    void emitTelemetry({ severity: "warn", service: "playbook-api", component: "request-boundary", operation: "same_origin", outcome: "denied", context: createTelemetryContext(request.headers, { route: request.nextUrl.pathname }), errorClassification: "OriginDenied" });
    return { ok: false, response: apiError("Cross-origin commands are not allowed.", 403) };
  }
  return { ok: true };
}

export async function readBoundedJson(
  request: NextRequest,
  maximumBytes: number,
): Promise<ApiBoundaryFailure | { ok: true; value: unknown }> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") {
    return { ok: false, response: apiError("Content-Type must be application/json.", 415) };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    return { ok: false, response: apiError("Request body is too large.", 413) };
  }

  let source: string;
  try {
    source = await request.text();
  } catch {
    return { ok: false, response: apiError("Request body could not be read.", 400) };
  }
  if (new TextEncoder().encode(source).byteLength > maximumBytes) {
    return { ok: false, response: apiError("Request body is too large.", 413) };
  }

  try {
    return { ok: true, value: JSON.parse(source) as unknown };
  } catch {
    return { ok: false, response: apiError("Request body must be valid JSON.", 400) };
  }
}

export async function requireAuthenticatedMutation(request: NextRequest) {
  const started = performance.now();
  incrementMetric("api_request_total");
  const telemetry = createTelemetryContext(request.headers, { route: request.nextUrl.pathname, authenticated: false });
  const origin = requireSameOrigin(request);
  if (!origin.ok) return origin;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    observeApiLatency(performance.now() - started);
    incrementMetric("auth_failure_total");
    await emitTelemetry({ severity: "warn", service: "playbook-api", component: "authentication", operation: "authenticate_mutation", outcome: "denied", context: telemetry, errorClassification: error ? "AuthenticationProviderError" : "AuthenticationRequired", dependency: "supabase-auth" });
    return { ok: false as const, response: apiError("Authentication required.", 401) };
  }
  observeApiLatency(performance.now() - started);
  return { ok: true as const, user: data.user, supabase, telemetry: { ...telemetry, authenticated: true } };
}

export async function consumeApiQuota(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<ApiBoundaryFailure | { ok: true; remaining: number }> {
  const { data, error } = await supabase.rpc("consume_api_quota", {
    p_scope: scope,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    incrementMetric("database_rpc_failure_total");
    await emitTelemetry({ severity: "error", service: "playbook-api", component: "quota", operation: "consume_api_quota", outcome: "failure", errorClassification: "QuotaRpcUnavailable", dependency: "supabase-rpc", metadata: { scope } });
    return { ok: false, response: apiError("Request quota is unavailable.", 503) };
  }
  const result = data as Record<string, unknown>;
  if (result.allowed !== true) {
    incrementMetric("api_rate_limit_total");
    await emitTelemetry({ severity: "warn", service: "playbook-api", component: "quota", operation: "consume_api_quota", outcome: "denied", errorClassification: "QuotaExceeded", dependency: "supabase-rpc", metadata: { scope } });
    const response = apiError("Request quota exceeded. Try again later.", 429);
    response.headers.set("Retry-After", String(windowSeconds));
    return { ok: false, response };
  }
  return {
    ok: true,
    remaining: typeof result.remaining === "number" ? result.remaining : 0,
  };
}

export function requireIdempotencyKey(request: NextRequest): ApiBoundaryFailure | { ok: true; value: string } {
  const value = request.headers.get("idempotency-key")?.trim() ?? "";
  if (value.length < 16 || value.length > 120 || !/^[A-Za-z0-9._:-]+$/.test(value)) {
    return { ok: false, response: apiError("A valid Idempotency-Key header is required.", 422) };
  }
  return { ok: true, value };
}
