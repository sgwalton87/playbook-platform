/**
 * =============================================================================
 * PBOS Kernel Engine
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4003 Kernel Lifecycle
 *   - PPS-4013 Kernel Certification
 *
 * Purpose:
 *   The constitutional execution entry point for PBOS.
 *
 *   All PBOS commands execute through the Kernel Engine.
 *
 * =============================================================================
 */

import { Kernel } from "../kernel";
import { RuntimeContext } from "../runtime/runtime-context";

export interface KernelEngine {
  execute(
    context: RuntimeContext,
  ): Promise<void>;
}

export class DefaultKernelEngine
  implements KernelEngine
{
  public constructor(
    private readonly kernel: Kernel,
  ) {}

  public async execute(
    _context: RuntimeContext,
  ): Promise<void> {
    await this.kernel.boot();

    try {
      await this.kernel.execute();
    } finally {
      await this.kernel.shutdown();
    }
  }
}
