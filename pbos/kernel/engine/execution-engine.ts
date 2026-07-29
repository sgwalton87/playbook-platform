/**
 * =============================================================================
 * PBOS Execution Engine
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Executes the constitutional pipeline and returns an immutable result.
 *
 * =============================================================================
 */

import { ExecutionContext } from "./execution-context";
import { ExecutionPipeline } from "./execution-pipeline";
import {
  ExecutionResult,
  ExecutionStatus,
} from "./execution-result";

export class ExecutionEngine {
  public constructor(
    private readonly pipeline: ExecutionPipeline,
  ) {}

  public async execute(
    context: ExecutionContext,
  ): Promise<ExecutionResult> {
    const startedAt = new Date();

    try {
      await this.pipeline.execute();

      const completedAt = new Date();

      return {
        executionId: context.executionId,
        status: ExecutionStatus.SUCCESS,
        startedAt,
        completedAt,
        durationMs:
          completedAt.getTime() - startedAt.getTime(),
        diagnostics: [],
      };
    } catch (error) {
      const completedAt = new Date();

      return {
        executionId: context.executionId,
        status: ExecutionStatus.FAILED,
        startedAt,
        completedAt,
        durationMs:
          completedAt.getTime() - startedAt.getTime(),
        diagnostics: [
          error instanceof Error
            ? error.message
            : "Unknown execution failure",
        ],
      };
    }
  }
}
