/**
 * =============================================================================
 * PBOS Runtime Manager
 * =============================================================================
 *
 * Purpose:
 *   Coordinates runtime discovery, registration, and execution.
 *
 * =============================================================================
 */

import { ExecutionContext } from "../kernel/engine/execution-context";
import { RuntimeRegistry } from "./runtime-registry";

export class RuntimeManager {
  public constructor(
    private readonly registry: RuntimeRegistry,
  ) {}

  public async execute(
    runtimeId: string,
    context: ExecutionContext,
  ): Promise<void> {
    const runtime =
      this.registry.resolve(runtimeId);

    await runtime.execute(context);
  }

  public exists(
    runtimeId: string,
  ): boolean {
    return this.registry.has(runtimeId);
  }
}
