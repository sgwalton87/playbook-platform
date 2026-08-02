export const TELEMETRY_SEVERITIES = ["debug", "info", "warn", "error", "critical"] as const;
export const TELEMETRY_OUTCOMES = ["success", "failure", "denied", "degraded"] as const;

export type TelemetrySeverity = (typeof TELEMETRY_SEVERITIES)[number];
export type TelemetryOutcome = (typeof TELEMETRY_OUTCOMES)[number];

export type TelemetryScalar = string | number | boolean | null;
export type TelemetryMetadata = Readonly<Record<string, TelemetryScalar | readonly TelemetryScalar[]>>;

export interface TelemetryContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly route?: string;
  readonly feature?: string;
  readonly actorType?: string;
  readonly authenticated?: boolean;
}

export interface TelemetryEventInput {
  readonly severity: TelemetrySeverity;
  readonly service: string;
  readonly component: string;
  readonly operation: string;
  readonly outcome: TelemetryOutcome;
  readonly context?: Partial<TelemetryContext>;
  readonly durationMs?: number;
  readonly errorClassification?: string;
  readonly dependency?: string;
  readonly retryCount?: number;
  readonly metadata?: TelemetryMetadata;
}

export interface TelemetryEvent {
  readonly schemaVersion: "1.0";
  readonly timestamp: string;
  readonly environment: string;
  readonly applicationVersion: string;
  readonly severity: TelemetrySeverity;
  readonly service: string;
  readonly component: string;
  readonly route?: string;
  readonly feature?: string;
  readonly operation: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly actorType?: string;
  readonly authenticated?: boolean;
  readonly outcome: TelemetryOutcome;
  readonly durationMs?: number;
  readonly errorClassification?: string;
  readonly dependency?: string;
  readonly retryCount?: number;
  readonly metadata?: TelemetryMetadata;
}

export type TelemetrySink = (event: TelemetryEvent) => void | Promise<void>;
