import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { TelemetryContext } from "./types";

const contextStorage = new AsyncLocalStorage<TelemetryContext>();
const SAFE_IDENTIFIER = /^[A-Za-z0-9._:-]{8,128}$/;

function safeIdentifier(value: string | null | undefined): string | null {
  const candidate = value?.trim() ?? "";
  return SAFE_IDENTIFIER.test(candidate) ? candidate : null;
}

export function createTelemetryContext(headers?: Headers, defaults: Partial<TelemetryContext> = {}): TelemetryContext {
  const requestId = safeIdentifier(headers?.get("x-request-id")) ?? randomUUID();
  const correlationId = safeIdentifier(headers?.get("x-correlation-id")) ?? defaults.correlationId ?? requestId;
  return { requestId, correlationId, ...defaults };
}

export function currentTelemetryContext(): TelemetryContext | undefined {
  return contextStorage.getStore();
}

export function withTelemetryContext<T>(context: TelemetryContext, work: () => T): T {
  return contextStorage.run(context, work);
}
