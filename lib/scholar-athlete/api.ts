import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTelemetryContext, emitTelemetry, incrementMetric } from "@/lib/observability";

export async function requireScholarAthleteApi() {
  const authorization = await resolveServerAuthorization({
    allowedRoles: ["scholar-athlete"],
  });
  if (!authorization.authorized) {
    const status = authorization.reason === "unauthenticated" ? 401 : 403;
    incrementMetric(status === 401 ? "auth_failure_total" : "database_authorization_failure_total");
    await emitTelemetry({ severity: "warn", service: "playbook-athlete-api", component: "authorization", operation: "authorize_scholar_athlete", outcome: "denied", errorClassification: status === 401 ? "AuthenticationRequired" : "RoleDenied" });
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: status === 401 ? "Authentication required." : "Scholar-Athlete access required." },
        { status },
      ),
    };
  }
  return {
    ok: true as const,
    authorization,
    supabase: await createServerSupabaseClient(),
  };
}

export function athleteApiFailure(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function governedCommandFailure(error: { message?: string } | null) {
  const known: Record<string, string> = {
    invalid_nil_stage_transition: "That NIL stage transition is not permitted.",
    nil_compliance_approval_required: "A signed agreement, submitted disclosure, and approved compliance review are required.",
    governed_nil_command_required: "Use the governed NIL workflow for this change.",
    nil_deal_not_ready_for_compliance: "Move this opportunity into negotiation before submitting compliance.",
    agreement_reference_required: "An agreement reference is required.",
    jurisdiction_required: "A jurisdiction is required for compliance review.",
  };
  return athleteApiFailure(known[error?.message ?? ""] ?? "The governed athlete command could not be completed.");
}

export function requireIdempotencyKey(request: NextRequest):
  | { ok: true; value: string }
  | { ok: false; response: NextResponse } {
  const value = request.headers.get("idempotency-key")?.trim() ?? "";
  if (value.length < 16 || value.length > 120 || !/^[a-zA-Z0-9._:-]+$/.test(value)) {
    return {
      ok: false,
      response: athleteApiFailure("A valid Idempotency-Key header is required.", 422),
    };
  }
  return { ok: true, value };
}

export function requireSameOrigin(request: NextRequest):
  | { ok: true }
  | { ok: false; response: NextResponse } {
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.PLAYBOOK_APP_URL;
  const allowed = new Set([request.nextUrl.origin]);
  if (configuredOrigin) {
    try {
      allowed.add(new URL(configuredOrigin).origin);
    } catch {
      return {
        ok: false,
        response: athleteApiFailure("Application origin is not configured safely.", 503),
      };
    }
  }
  if (!origin || !allowed.has(origin)) {
    incrementMetric("api_error_total");
    void emitTelemetry({ severity: "warn", service: "playbook-athlete-api", component: "request-boundary", operation: "same_origin", outcome: "denied", context: createTelemetryContext(request.headers, { route: request.nextUrl.pathname }), errorClassification: "OriginDenied" });
    return {
      ok: false,
      response: athleteApiFailure("Cross-origin athlete commands are not allowed.", 403),
    };
  }
  return { ok: true };
}
