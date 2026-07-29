/**
 * =============================================================================
 * PBOS Execution Result
 * =============================================================================
 *
 * Authority:
 *   - PPS-4013 Kernel Certification
 *
 * Purpose:
 *   Defines the canonical outcome of a constitutional Kernel execution.
 *
 * =============================================================================
 */

export enum ExecutionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface ExecutionResult {
  readonly executionId: string;
  readonly status: ExecutionStatus;
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly durationMs: number;
  readonly diagnostics: readonly string[];
}
