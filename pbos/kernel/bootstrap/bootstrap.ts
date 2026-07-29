/**
 * =============================================================================
 * PBOS Kernel Bootstrap
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4002 Kernel Services
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Creates and initializes the constitutional PBOS Kernel.
 *
 * =============================================================================
 */

import { Kernel } from "../kernel";
import { KernelContext } from "../context";
import { KernelServices } from "../services";

export interface BootstrapOptions {
  readonly context: KernelContext;
  readonly services: KernelServices;
}

export function bootstrapKernel(
  options: BootstrapOptions,
): Kernel {
  return new Kernel({
    context: options.context,
    services: options.services,
  });
}
