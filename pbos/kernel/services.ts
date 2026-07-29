/**
 * =============================================================================
 * PBOS Kernel Services
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Defines the constitutional service contracts required by the PBOS Kernel.
 *
 * The Kernel depends only upon these interfaces.
 *
 * Concrete implementations are provided elsewhere.
 *
 * =============================================================================
 */

export interface LifecycleService {
  startup(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface ValidationService {
  validate(): Promise<void>;
}

export interface SchedulerService {
  schedule(): Promise<void>;
}

export interface StateService {
  synchronize(): Promise<void>;
}

export interface EventService {
  publish(event: string): Promise<void>;
}

export interface CertificationService {
  certify(): Promise<void>;
}

export interface ObservabilityService {
  record(metric: string): Promise<void>;
}

export interface RecoveryService {
  recover(): Promise<void>;
}

export interface RegistryService {
  initialize(): Promise<void>;
}

export interface KernelServices {
  readonly lifecycle: LifecycleService;
  readonly validation: ValidationService;
  readonly scheduler: SchedulerService;
  readonly state: StateService;
  readonly events: EventService;
  readonly certification: CertificationService;
  readonly observability: ObservabilityService;
  readonly recovery: RecoveryService;
  readonly registry: RegistryService;
}
