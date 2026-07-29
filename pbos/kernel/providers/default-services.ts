/**
 * =============================================================================
 * PBOS Default Kernel Services
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Provides the default constitutional implementations for Kernel services.
 *
 * =============================================================================
 */

import {
  CertificationService,
  EventService,
  KernelServices,
  LifecycleService,
  ObservabilityService,
  RecoveryService,
  RegistryService,
  SchedulerService,
  StateService,
  ValidationService,
} from "../services";

export class DefaultKernelServices implements KernelServices {
  public constructor(
    public readonly lifecycle: LifecycleService,
    public readonly validation: ValidationService,
    public readonly scheduler: SchedulerService,
    public readonly state: StateService,
    public readonly events: EventService,
    public readonly certification: CertificationService,
    public readonly observability: ObservabilityService,
    public readonly recovery: RecoveryService,
    public readonly registry: RegistryService,
  ) {}
}
