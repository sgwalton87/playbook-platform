import "server-only";

import { currentTelemetryContext } from "./context";
import { redactTelemetryMetadata, sanitizeRoute } from "./redaction";
import type { TelemetryEvent, TelemetryEventInput, TelemetrySink } from "./types";

const defaultSink: TelemetrySink = (event) => {
  const serialized = JSON.stringify(event);
  if (event.severity === "error" || event.severity === "critical") console.error(serialized);
  else if (event.severity === "warn") console.warn(serialized);
  else console.log(serialized);
};

function normalizedDuration(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : undefined;
}

export function createTelemetryEvent(input: TelemetryEventInput, now = new Date()): TelemetryEvent {
  const inherited = currentTelemetryContext();
  const context = { ...inherited, ...input.context };
  return {
    schemaVersion: "1.0",
    timestamp: now.toISOString(),
    environment: process.env.PLAYBOOK_DEPLOYMENT_ENV?.trim() || process.env.NODE_ENV || "unknown",
    applicationVersion: process.env.PLAYBOOK_RELEASE?.trim() || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unversioned",
    severity: input.severity,
    service: input.service,
    component: input.component,
    route: sanitizeRoute(context.route),
    feature: context.feature,
    operation: input.operation,
    requestId: context.requestId,
    correlationId: context.correlationId,
    actorType: context.actorType,
    authenticated: context.authenticated,
    outcome: input.outcome,
    durationMs: normalizedDuration(input.durationMs),
    errorClassification: input.errorClassification,
    dependency: input.dependency,
    retryCount: input.retryCount,
    metadata: redactTelemetryMetadata(input.metadata),
  };
}

export async function emitTelemetry(input: TelemetryEventInput, sink: TelemetrySink = defaultSink): Promise<TelemetryEvent> {
  const event = createTelemetryEvent(input);
  await sink(event);
  return event;
}

export function classifyError(error: unknown): string {
  if (error instanceof Error) return error.name || "Error";
  return "UnknownError";
}

export async function captureOperationalError(
  error: unknown,
  input: Omit<TelemetryEventInput, "severity" | "outcome" | "errorClassification">,
  sink?: TelemetrySink,
): Promise<TelemetryEvent> {
  return emitTelemetry({ ...input, severity: "error", outcome: "failure", errorClassification: classifyError(error) }, sink);
}

export async function traceOperation<T>(
  input: Omit<TelemetryEventInput, "severity" | "outcome" | "durationMs">,
  work: () => Promise<T>,
  sink?: TelemetrySink,
): Promise<T> {
  const started = performance.now();
  try {
    const result = await work();
    await emitTelemetry({ ...input, severity: "info", outcome: "success", durationMs: performance.now() - started }, sink);
    return result;
  } catch (error: unknown) {
    await captureOperationalError(error, { ...input, durationMs: performance.now() - started }, sink);
    throw error;
  }
}
