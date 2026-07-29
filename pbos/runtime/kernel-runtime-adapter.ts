/**
 * =============================================================================
 * PBOS Kernel Runtime Adapter
 * =============================================================================
 *
 * Purpose:
 *   Adapts the existing PBOS runtime to execute through the constitutional
 *   Kernel Execution Engine.
 *
 * =============================================================================
 */

import { ExecutionContext } from "../kernel/engine/execution-context";
import { ExecutionEngine } from "../kernel/engine/execution-engine";

export interface RuntimeAdapter {
  execute(
    context: ExecutionContext,
  ): Promise<void>;
}

export class KernelRuntimeAdapter
  implements RuntimeAdapter
{
  public constructor(
    private readonly engine: ExecutionEngine,
  ) {}

  public async execute(
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
