/**
 * =============================================================================
 * PBOS Runtime Bootstrap
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Bootstraps a constitutional Kernel Runtime from configured services.
 *
 * =============================================================================
 */

import { KernelContext } from "../context";
import { KernelServices } from "../services";
import { createDefaultKernel } from "./default-kernel";
import { DefaultKernelRuntime } from "../runtime/kernel-runtime";

export function bootstrapRuntime(
  context: KernelContext,
  services: KernelServices,
): DefaultKernelRuntime {
  const kernel = createDefaultKernel(
    context,
    services,
  );

  return new DefaultKernelRuntime(kernel);
}
