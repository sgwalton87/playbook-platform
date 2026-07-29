/**
 * =============================================================================
 * PBOS Constitutional Runtime
 * =============================================================================
 *
 * Purpose:
 *   Canonical runtime responsible for executing PBOS through the
 *   constitutional Kernel.
 *
 * =============================================================================
 */

import { ExecutionContext } from "../kernel/engine/execution-context";
import { ExecutionEngine } from "../kernel/engine/execution-engine";

export class KernelRuntime {
  public constructor(
    private readonly engine: ExecutionEngine,
  ) {}

  public async execute(
    context: ExecutionContext,
  ): Promise<void> {
    const result = await this.engine.execute(context);

    if (result.status !== "SUCCESS") {
      throw new Error(
        `Execution failed (${result.executionId}).`,
      );
    }
  }
}
