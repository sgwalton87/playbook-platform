/**
 * =============================================================================
 * PBOS Execution Pipeline
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Coordinates the constitutional execution sequence for PBOS.
 *
 * =============================================================================
 */

export interface ExecutionStage {
  readonly name: string;

  execute(): Promise<void>;
}

export class ExecutionPipeline {
  private readonly stages: ExecutionStage[] = [];

  public register(
    stage: ExecutionStage,
  ): void {
    this.stages.push(stage);
  }

  public async execute(): Promise<void> {
    for (const stage of this.stages) {
      await stage.execute();
    }
  }

  public list(): readonly ExecutionStage[] {
    return [...this.stages];
  }
}
