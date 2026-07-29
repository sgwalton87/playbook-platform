/**
 * =============================================================================
 * PBOS Execution Context
 * =============================================================================
 *
 * Authority:
 *   - PPS-4005 Kernel State Management
 *
 * Purpose:
 *   Carries immutable execution metadata through the constitutional pipeline.
 *
 * =============================================================================
 */

export interface ExecutionContext {
  readonly executionId: string;

  readonly command: string;

  readonly startedAt: Date;

  readonly initiatedBy: string;

  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createExecutionContext(
  context: ExecutionContext,
): Readonly<ExecutionContext> {
  return Object.freeze(context);
}
