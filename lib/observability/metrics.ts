import "server-only";

export const PLATFORM_METRICS = [
  "auth_failure_total",
  "registration_failure_total",
  "verification_failure_total",
  "recovery_failure_total",
  "session_failure_total",
  "api_request_total",
  "api_error_total",
  "api_rate_limit_total",
  "database_query_failure_total",
  "database_authorization_failure_total",
  "database_rpc_failure_total",
  "onboarding_completion_total",
  "scholar_record_creation_total",
  "evidence_submission_total",
  "portfolio_creation_total",
  "athlete_profile_completion_total",
  "recruiting_interaction_total",
  "nil_workflow_readiness_total",
  "invitation_total",
  "notification_total",
  "delivery_failure_total",
] as const;

export type PlatformMetricName = (typeof PLATFORM_METRICS)[number];

type MetricSnapshot = {
  readonly generatedAt: string;
  readonly processStartedAt: string;
  readonly counters: Readonly<Record<PlatformMetricName, number>>;
  readonly apiLatencyMs: { readonly count: number; readonly total: number; readonly maximum: number };
};

const processStartedAt = new Date().toISOString();
const counters = Object.fromEntries(PLATFORM_METRICS.map((name) => [name, 0])) as Record<PlatformMetricName, number>;
const latency = { count: 0, total: 0, maximum: 0 };

export function incrementMetric(name: PlatformMetricName, amount = 1): void {
  if (!Number.isFinite(amount) || amount <= 0) return;
  counters[name] += amount;
}

export function observeApiLatency(durationMs: number): void {
  if (!Number.isFinite(durationMs) || durationMs < 0) return;
  latency.count += 1;
  latency.total += durationMs;
  latency.maximum = Math.max(latency.maximum, durationMs);
}

export function snapshotPlatformMetrics(now = new Date()): MetricSnapshot {
  return {
    generatedAt: now.toISOString(),
    processStartedAt,
    counters: { ...counters },
    apiLatencyMs: {
      count: latency.count,
      total: Math.round(latency.total * 100) / 100,
      maximum: Math.round(latency.maximum * 100) / 100,
    },
  };
}

export function resetPlatformMetricsForTests(): void {
  PLATFORM_METRICS.forEach((name) => { counters[name] = 0; });
  latency.count = 0;
  latency.total = 0;
  latency.maximum = 0;
}
