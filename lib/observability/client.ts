"use client";

type ClientTelemetryKind = "client_error" | "unhandled_rejection" | "navigation_failure";

function correlationId(): string {
  const key = "playbook-correlation-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

export function reportClientFailure(kind: ClientTelemetryKind, classification: string): void {
  try {
    const body = JSON.stringify({
      kind,
      classification: classification.slice(0, 80),
      route: window.location.pathname,
      correlationId: correlationId(),
      timestamp: new Date().toISOString(),
    });
    navigator.sendBeacon("/api/telemetry/client", new Blob([body], { type: "application/json" }));
  } catch {
    // Telemetry must never interrupt the user experience.
  }
}
