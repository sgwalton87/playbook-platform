/**
 * =============================================================================
 * PBOS Default Execution Pipeline
 * =============================================================================
 *
 * Authority:
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Registers the canonical constitutional execution stages.
 *
 * =============================================================================
 */

import { ExecutionPipeline } from "./execution-pipeline";
import { ExecutionStage } from "./stage";

export class DefaultExecutionPipeline {
  private readonly pipeline = new ExecutionPipeline();

  public register(
    stage: ExecutionStage,
  ): void {
    this.pipeline.register({
      name: stage.name,
      execute: () =>
        stage.execute({
          executionId: "",
          command: "",
          startedAt: new Date(),
          initiatedBy: "kernel",
          metadata: {},
        }),
    });
  }

  public pipelineInstance(): ExecutionPipeline {
    return this.pipeline;
  }
}
