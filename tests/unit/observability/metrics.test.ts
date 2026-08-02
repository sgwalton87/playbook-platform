import { beforeEach, describe, expect, it } from "vitest";
import { incrementMetric, observeApiLatency, resetPlatformMetricsForTests, snapshotPlatformMetrics } from "../../../lib/observability/metrics";

describe("platform health metrics", () => {
  beforeEach(() => resetPlatformMetricsForTests());

  it("records allowlisted counters and API latency without labels containing user data", () => {
    incrementMetric("auth_failure_total");
    incrementMetric("database_rpc_failure_total", 2);
    observeApiLatency(25.25);
    observeApiLatency(75.75);
    const snapshot = snapshotPlatformMetrics(new Date("2026-08-01T00:00:00.000Z"));
    expect(snapshot.counters.auth_failure_total).toBe(1);
    expect(snapshot.counters.database_rpc_failure_total).toBe(2);
    expect(snapshot.apiLatencyMs).toEqual({ count: 2, total: 101, maximum: 75.75 });
    expect(snapshot.generatedAt).toBe("2026-08-01T00:00:00.000Z");
    expect(JSON.stringify(snapshot)).not.toMatch(/email|userId|scholarId|message|token/i);
  });

  it("ignores invalid metric increments and latency observations", () => {
    incrementMetric("api_error_total", -1);
    observeApiLatency(Number.NaN);
    observeApiLatency(-10);
    const snapshot = snapshotPlatformMetrics();
    expect(snapshot.counters.api_error_total).toBe(0);
    expect(snapshot.apiLatencyMs.count).toBe(0);
  });
});
