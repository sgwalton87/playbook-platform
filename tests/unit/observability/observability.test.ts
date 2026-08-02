import { describe, expect, it } from "vitest";
import { createTelemetryContext } from "../../../lib/observability/context";
import { createTelemetryEvent, captureOperationalError, traceOperation } from "../../../lib/observability/logger";
import { redactTelemetryMetadata, sanitizeRoute } from "../../../lib/observability/redaction";
import { OPERATIONAL_ALERTS, validateOperationalAlerts } from "../../../lib/observability/alerts";
import { GOVERNED_SCHOLAR_SYNTHETIC, validateSyntheticJourney } from "../../../lib/observability/synthetics";
import type { TelemetryEvent } from "../../../lib/observability/types";

describe("operational observability", () => {
  it("creates a machine-readable structured event", () => {
    const event = createTelemetryEvent({ severity: "info", service: "playbook", component: "test", operation: "contract", outcome: "success", context: { requestId: "request-1234", correlationId: "correlation-1234", route: "/portfolio?token=private" }, durationMs: 12.345 });
    expect(event.schemaVersion).toBe("1.0");
    expect(event.route).toBe("/portfolio");
    expect(event.requestId).toBe("request-1234");
    expect(event.durationMs).toBe(12.35);
    expect(() => JSON.parse(JSON.stringify(event))).not.toThrow();
  });

  it("redacts credentials, PII, communications, and token-shaped values", () => {
    const redacted = redactTelemetryMetadata({ password: "secret", email: "scholar@example.com", message: "private", safeCode: "Bearer abcdefghijklmnop", count: 2 });
    expect(redacted).toEqual({ password: "[REDACTED]", email: "[REDACTED]", message: "[REDACTED]", safeCode: "[REDACTED]", count: 2 });
    expect(JSON.stringify(redacted)).not.toContain("scholar@example.com");
  });

  it("accepts safe request correlation and replaces unsafe identifiers", () => {
    const safe = createTelemetryContext(new Headers({ "x-request-id": "request-1234", "x-correlation-id": "correlation-1234" }));
    const unsafe = createTelemetryContext(new Headers({ "x-request-id": "Bearer private-token" }));
    expect(safe).toMatchObject({ requestId: "request-1234", correlationId: "correlation-1234" });
    expect(unsafe.requestId).not.toContain("private-token");
    expect(unsafe.correlationId).toBe(unsafe.requestId);
  });

  it("captures classified errors without error messages", async () => {
    const events: TelemetryEvent[] = [];
    await captureOperationalError(new TypeError("private student information"), { service: "playbook", component: "test", operation: "failure" }, (event) => { events.push(event); });
    expect(events[0].errorClassification).toBe("TypeError");
    expect(JSON.stringify(events[0])).not.toContain("private student information");
  });

  it("traces successful and failed dependencies with duration", async () => {
    const events: TelemetryEvent[] = [];
    await expect(traceOperation({ service: "playbook", component: "test", operation: "provider", dependency: "test-provider" }, async () => "ok", (event) => { events.push(event); })).resolves.toBe("ok");
    await expect(traceOperation({ service: "playbook", component: "test", operation: "provider", dependency: "test-provider" }, async () => { throw new Error("provider payload"); }, (event) => { events.push(event); })).rejects.toThrow("provider payload");
    expect(events.map(({ outcome }) => outcome)).toEqual(["success", "failure"]);
    expect(events.every(({ durationMs }) => typeof durationMs === "number")).toBe(true);
  });

  it("validates critical, high, and medium alert contracts", () => {
    expect(validateOperationalAlerts()).toEqual([]);
    expect(new Set(OPERATIONAL_ALERTS.map(({ severity }) => severity))).toEqual(new Set(["critical", "high", "medium"]));
  });

  it("validates the public-to-Scholar synthetic journey", () => {
    expect(validateSyntheticJourney()).toEqual([]);
    expect(GOVERNED_SCHOLAR_SYNTHETIC.map(({ route }) => route)).toEqual(["/", "/login", "/dashboard", "/record", "/portfolio"]);
    expect(sanitizeRoute("/record?scholarId=private")).toBe("/record");
  });
});
