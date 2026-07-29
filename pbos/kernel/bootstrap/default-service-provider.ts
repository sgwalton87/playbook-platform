/**
 * =============================================================================
 * PBOS Default Service Provider
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Composes the default constitutional Kernel services.
 *
 * =============================================================================
 */

import { DefaultKernelServices } from "../providers/default-services";
import {
  DefaultKernelLifecycle,
} from "../lifecycle";
import {
  DefaultScheduler,
} from "../scheduler";
import {
  KernelEventBus,
} from "../events";
import {
  KernelValidator,
} from "../validation";
import {
  KernelCertificationEngine,
} from "../certification";
import {
  InMemoryObservabilityService,
} from "../observability";
import {
  KernelRecoveryManager,
} from "../recovery";
import {
  KernelRegistry,
} from "../registry";

export function createDefaultServices(): DefaultKernelServices {
  return new DefaultKernelServices(
    new DefaultKernelLifecycle(),
    new KernelValidator([]),
    new DefaultScheduler(),
    {
      async synchronize(): Promise<void> {},
    },
    new KernelEventBus(),
    new KernelCertificationEngine(),
    new InMemoryObservabilityService(),
    new KernelRecoveryManager([]),
    new KernelRegistry(),
  );
}
