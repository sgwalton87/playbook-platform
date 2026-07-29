/**
 * =============================================================================
 * PBOS Kernel Phase Runner
 * =============================================================================
 *
 * Purpose:
 *   Executes the existing PBOS runtime through the constitutional Kernel.
 *
 * =============================================================================
 */

import { ExecutionContext } from "../kernel/engine/execution-context";
import { ExecutionEngine } from "../kernel/engine/execution-engine";

export class KernelPhaseRunner {
  public constructor(
    private readonly engine: ExecutionEngine,
  ) {}

  public async run(
    context: ExecutionContext,
  ): Promise<void> {
    const result = await this.engine.execute(context);

    if (result.status !== "SUCCESS") {
      throw new Error(
        `Kernel execution failed (${result.executionId}).`,
      );
    }
  }
}
