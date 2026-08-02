import { NextRequest, NextResponse } from "next/server";
import { createTelemetryContext, emitTelemetry } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const context = createTelemetryContext(request.headers, { route: "/api/health/ready", feature: "platform-health" });
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
  const missing = required.filter((name) => !process.env[name]);
  const ready = missing.length === 0;
  await emitTelemetry({
    severity: ready ? "info" : "error",
    service: "playbook-platform",
    component: "readiness",
    operation: "configuration_readiness",
    outcome: ready ? "success" : "degraded",
    context,
    errorClassification: ready ? undefined : "RequiredConfigurationMissing",
    metadata: { missingCount: missing.length },
  });
  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      service: "playbook-platform",
      environment: process.env.PLAYBOOK_DEPLOYMENT_ENV || process.env.NODE_ENV || "unknown",
      release: process.env.PLAYBOOK_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unversioned",
      checks: { configuration: ready ? "pass" : "fail", telemetry: "pass" },
      missing,
      requestId: context.requestId,
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store", "X-Request-Id": context.requestId, "X-Correlation-Id": context.correlationId },
    },
  );
}
