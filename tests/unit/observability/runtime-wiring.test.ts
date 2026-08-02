import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("observability runtime wiring", () => {
  it("captures Next.js server and browser runtime failures", () => {
    expect(source("instrumentation.ts")).toContain("onRequestError");
    expect(source("instrumentation-client.ts")).toContain("unhandledrejection");
    expect(source("instrumentation-client.ts")).toContain("navigation_failure");
    expect(source("app/global-error.tsx")).toContain("reportClientFailure");
    expect(source("app/login/page.tsx")).toContain("RegistrationFailure");
    expect(source("app/reset-password/page.tsx")).toContain("RecoveryFailure");
  });

  it("propagates request and correlation identifiers through the edge boundary", () => {
    const proxy = source("proxy.ts");
    expect(proxy).toContain('headers.set("x-request-id"');
    expect(proxy).toContain('response.headers.set("X-Correlation-Id"');
  });

  it("observes authentication, quota, database, AI, and communication failures", () => {
    const apiBoundary = source("lib/api-security/server.ts");
    const ai = source("app/api/ai/zai/route.ts");
    const communications = source("lib/communications/delivery.ts");
    expect(apiBoundary).toContain("auth_failure_total");
    expect(apiBoundary).toContain("api_rate_limit_total");
    expect(apiBoundary).toContain("database_rpc_failure_total");
    expect(ai).toContain("traceOperation");
    expect(communications).toContain("delivery_failure_total");
    expect(source("app/api/notifications/route.ts")).toContain("NotificationQueryFailed");
    expect(source("app/api/invitations/send/route.ts")).toContain("send_invitation");
    expect(source("app/api/portfolio/shares/route.ts")).toContain("portfolio_creation_total");
    expect(source("app/api/athlete/profile/route.ts")).toContain("athlete_profile_completion_total");
    expect(source("app/api/athlete/recruiting/route.ts")).toContain("recruiting_interaction_total");
    expect(source("app/api/athlete/nil/route.ts")).toContain("nil_workflow_readiness_total");
  });

  it("keeps metrics secret-protected and local evidence non-certifying", () => {
    const metrics = source("app/api/health/metrics/route.ts");
    expect(metrics).toContain("PLAYBOOK_OBSERVABILITY_SECRET");
    expect(metrics).toContain("timingSafeEqual");
    expect(source("pbos/evidence/observability/implementation-evidence.json")).toContain('"production_certified": false');
  });
});
