import { NextRequest, NextResponse } from "next/server";
import { createTelemetryContext, emitTelemetry, incrementMetric, withTelemetryContext } from "@/lib/observability";
import { readBoundedJson, requireSameOrigin } from "@/lib/api-security/server";

const KINDS = new Set(["client_error", "unhandled_rejection", "navigation_failure"]);
const SAFE_CLASSIFICATION = /^[A-Za-z][A-Za-z0-9_.:-]{0,79}$/;
const SAFE_CORRELATION = /^[A-Za-z0-9._:-]{8,128}$/;
let windowStartedAt = Date.now();
let eventsInWindow = 0;

function consumeAnonymousCapacity(now = Date.now()): boolean {
  if (now - windowStartedAt >= 60_000) {
    windowStartedAt = now;
    eventsInWindow = 0;
  }
  eventsInWindow += 1;
  return eventsInWindow <= 120;
}

export async function POST(request: NextRequest) {
  const context = createTelemetryContext(request.headers, { route: "/api/telemetry/client", feature: "observability" });
  return withTelemetryContext(context, async () => {
    const origin = requireSameOrigin(request);
    if (!origin.ok) return origin.response;
    if (!consumeAnonymousCapacity()) {
      incrementMetric("api_rate_limit_total");
      return NextResponse.json({ ok: false, error: "Telemetry capacity exceeded." }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "60" } });
    }
    const parsed = await readBoundedJson(request, 4096);
    if (!parsed.ok) return parsed.response;
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return NextResponse.json({ ok: false, error: "Invalid telemetry event." }, { status: 422 });
    }
    const body = parsed.value as Record<string, unknown>;
    if (typeof body.kind !== "string" || !KINDS.has(body.kind) || typeof body.classification !== "string" || !SAFE_CLASSIFICATION.test(body.classification)) {
      return NextResponse.json({ ok: false, error: "Invalid telemetry event." }, { status: 422 });
    }
    incrementMetric("api_error_total");
    if (body.classification === "RegistrationFailure") incrementMetric("registration_failure_total");
    if (body.classification === "LoginFailure") incrementMetric("auth_failure_total");
    if (body.classification === "AuthTokenVerificationFailed") incrementMetric("verification_failure_total");
    if (body.classification === "RecoveryFailure") incrementMetric("recovery_failure_total");
    if (body.classification === "AuthSessionResolutionFailed") incrementMetric("session_failure_total");
    await emitTelemetry({
      severity: "error",
      service: "playbook-web",
      component: "client-runtime",
      operation: body.kind,
      outcome: "failure",
      errorClassification: body.classification,
      context: { route: typeof body.route === "string" ? body.route : undefined, correlationId: typeof body.correlationId === "string" && SAFE_CORRELATION.test(body.correlationId) ? body.correlationId : context.correlationId },
    });
    return new NextResponse(null, { status: 202, headers: { "Cache-Control": "no-store", "X-Request-Id": context.requestId, "X-Correlation-Id": context.correlationId } });
  });
}
