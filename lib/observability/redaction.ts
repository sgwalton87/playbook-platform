import type { TelemetryMetadata, TelemetryScalar } from "./types";

const SENSITIVE_KEY = /(?:password|passcode|token|secret|authorization|cookie|api[_-]?key|service[_-]?role|email|phone|address|message|prompt|response|transcript|financial|bank|account|ssn|student|scholar[_-]?id|user[_-]?id|actor[_-]?id)/i;
const SECRET_VALUE = /(?:bearer\s+[a-z0-9._~+\/-]+=*|(?:sk|pk|eyj)[-_a-z0-9]{12,}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;
const REDACTED = "[REDACTED]";

function safeValue(value: TelemetryScalar): TelemetryScalar {
  if (typeof value !== "string") return value;
  if (SECRET_VALUE.test(value)) return REDACTED;
  return value.length > 256 ? `${value.slice(0, 253)}...` : value;
}

export function redactTelemetryMetadata(metadata: TelemetryMetadata | undefined): TelemetryMetadata | undefined {
  if (!metadata) return undefined;
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      SENSITIVE_KEY.test(key)
        ? REDACTED
        : Array.isArray(value)
          ? value.map((entry) => safeValue(entry))
          : safeValue(value as TelemetryScalar),
    ]),
  );
}

export function sanitizeRoute(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, "https://playbook.invalid");
    return url.pathname.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ":id");
  } catch {
    return value.split("?", 1)[0]?.slice(0, 256);
  }
}
