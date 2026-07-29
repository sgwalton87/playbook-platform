/**
 * =============================================================================
 * PBOS Kernel Factory
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Creates a fully configured Kernel from constitutional dependencies.
 *
 * =============================================================================
 */

import { Kernel } from "../kernel";
import { KernelContext } from "../context";
import { KernelServices } from "../services";

export interface KernelFactoryOptions {
  readonly context: KernelContext;
  readonly services: KernelServices;
}

export class KernelFactory {
  public create(
    options: KernelFactoryOptions,
  ): Kernel {
    return new Kernel({
      context: options.context,
      services: options.services,
    });
  }
}
