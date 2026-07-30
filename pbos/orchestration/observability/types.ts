import type { ExecutionResult } from "../runner";

export interface ExecutionHealth {
  readonly status: "HEALTHY" | "DEGRADED" | "FAILED";
  readonly validation_count: number;
  readonly failure_count: number;
}

export interface ExecutionTimeline {
  readonly execution_id: string;
  readonly started_at: string;
  readonly completed_at: string;
  readonly duration_ms: number;
}

export interface ExecutionRiskReport {
  readonly execution_id: string;
  readonly artifact_count: number;
  readonly rollback_available: boolean;
  readonly findings: readonly string[];
}

export interface ExecutionSummary {
  readonly result: ExecutionResult;
  readonly health: ExecutionHealth;
  readonly timeline: ExecutionTimeline;
  readonly risk: ExecutionRiskReport;
  readonly digest: string;
}
