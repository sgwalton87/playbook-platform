/**
 * =============================================================================
 * PBOS Runtime Factory
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Creates the canonical PBOS Runtime used for constitutional execution.
 *
 * =============================================================================
 */

import { KernelContext } from "../context";
import { KernelServices } from "../services";
import { DefaultKernelRuntime } from "../runtime/kernel-runtime";
import { createDefaultKernel } from "./default-kernel";

export class RuntimeFactory {
  public create(
    context: KernelContext,
    services: KernelServices,
  ): DefaultKernelRuntime {
    const kernel = createDefaultKernel(
      context,
      services,
    );

    return new DefaultKernelRuntime(kernel);
  }
}
