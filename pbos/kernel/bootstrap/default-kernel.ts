/**
 * =============================================================================
 * Default PBOS Kernel
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *
 * Purpose:
 *   Provides the canonical Kernel instance for PBOS execution.
 *
 * =============================================================================
 */

import { Kernel } from "../kernel";
import { KernelContext } from "../context";
import { KernelServices } from "../services";
import { KernelFactory } from "./factory";

export function createDefaultKernel(
  context: KernelContext,
  services: KernelServices,
): Kernel {
  return new KernelFactory().create({
    context,
    services,
  });
}
