/**
 * =============================================================================
 * PBOS Kernel Runtime
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Executes the constitutional runtime pipeline through the Kernel.
 *
 * =============================================================================
 */

import { Kernel } from "../kernel";

export interface KernelRuntime {
  run(): Promise<void>;
}

export class DefaultKernelRuntime implements KernelRuntime {
  public constructor(
    private readonly kernel: Kernel,
  ) {}

  public async run(): Promise<void> {
    await this.kernel.boot();

    try {
      await this.kernel.execute();
    } finally {
      await this.kernel.shutdown();
    }
  }
}
