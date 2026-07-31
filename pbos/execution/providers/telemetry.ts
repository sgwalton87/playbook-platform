import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ExecutionTask } from "../tasks";

export const PROVIDER_EXECUTION_EVENT_TYPES = [
  "PROVIDER_STARTED",
  "PROVIDER_RUNNING",
  "PROVIDER_OUTPUT_RECEIVED",
  "PROVIDER_WAITING",
  "PROVIDER_COMPLETED",
  "PROVIDER_FAILED",
] as const;

export type ProviderExecutionEventType =
  (typeof PROVIDER_EXECUTION_EVENT_TYPES)[number];

export type ProviderExecutionStatus =
  | "STARTING"
  | "RUNNING"
  | "WAITING"
  | "COMPLETED"
  | "FAILED";

export interface ProviderExecutionEvent {
  readonly sequence: number;
  readonly type: ProviderExecutionEventType;
  readonly timestamp: string;
  readonly elapsed_ms: number;
  readonly detail: string;
  readonly payload_digest?: string;
}

export interface ExecutionTelemetry {
  readonly version: "1.0.0";
  readonly owner: "execution-provider-telemetry";
  readonly execution_id: string;
  readonly provider: string;
  readonly task: string;
  readonly milestone: string;
  readonly phase: "PROVIDER_EXECUTION";
  readonly status: ProviderExecutionStatus;
  readonly started_at: string;
  readonly updated_at: string;
  readonly completed_at: string | null;
  readonly last_provider_event: ProviderExecutionEventType;
  readonly events: readonly ProviderExecutionEvent[];
  readonly completion_state: "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  readonly digest: string;
}

export type ProviderEventSink = (
  telemetry: ExecutionTelemetry,
  event: ProviderExecutionEvent
) => void;

export class ExecutionTelemetryRecorder {
  readonly #rootDir: string;
  readonly #executionId: string;
  readonly #task: ExecutionTask;
  readonly #startedAt: string;
  readonly #startedMs: number;
  readonly #now: () => Date;
  readonly #sink?: ProviderEventSink;
  #events: ProviderExecutionEvent[] = [];

  constructor(input: {
    readonly rootDir: string;
    readonly executionId: string;
    readonly task: ExecutionTask;
    readonly startedAt: string;
    readonly now?: () => Date;
    readonly sink?: ProviderEventSink;
  }) {
    this.#rootDir = input.rootDir;
    this.#executionId = input.executionId;
    this.#task = input.task;
    this.#startedAt = input.startedAt;
    this.#startedMs = Date.parse(input.startedAt);
    this.#now = input.now ?? (() => new Date());
    this.#sink = input.sink;
  }

  record(
    type: ProviderExecutionEventType,
    detail: string,
    payload?: unknown
  ): ExecutionTelemetry {
    const now = this.#now();
    const event: ProviderExecutionEvent = {
      sequence: this.#events.length + 1,
      type,
      timestamp: now.toISOString(),
      elapsed_ms: Math.max(0, now.getTime() - this.#startedMs),
      detail,
      ...(payload === undefined
        ? {}
        : { payload_digest: artifactDigest(payload) }),
    };
    this.#events.push(event);
    const telemetry = this.#snapshot(type, now.toISOString());
    Runtime.save(
      path.join(this.#rootDir, Artifacts.executionTelemetry),
      telemetry,
      "execution-provider-telemetry"
    );
    this.#sink?.(telemetry, event);
    return telemetry;
  }

  #snapshot(
    lastEvent: ProviderExecutionEventType,
    updatedAt: string
  ): ExecutionTelemetry {
    const status: ProviderExecutionStatus =
      lastEvent === "PROVIDER_STARTED"
        ? "STARTING"
        : lastEvent === "PROVIDER_WAITING"
          ? "WAITING"
          : lastEvent === "PROVIDER_COMPLETED"
            ? "COMPLETED"
            : lastEvent === "PROVIDER_FAILED"
              ? "FAILED"
              : "RUNNING";
    const completionState =
      status === "COMPLETED"
        ? "SUCCEEDED" as const
        : status === "FAILED"
          ? "FAILED" as const
          : "IN_PROGRESS" as const;
    const body = {
      version: "1.0.0" as const,
      owner: "execution-provider-telemetry" as const,
      execution_id: this.#executionId,
      provider: this.#task.provider_id,
      task: this.#task.task_id,
      milestone: this.#task.milestone_id,
      phase: "PROVIDER_EXECUTION" as const,
      status,
      started_at: this.#startedAt,
      updated_at: updatedAt,
      completed_at: completionState === "IN_PROGRESS" ? null : updatedAt,
      last_provider_event: lastEvent,
      events: [...this.#events],
      completion_state: completionState,
    };
    return { ...body, digest: artifactDigest(body) };
  }
}
