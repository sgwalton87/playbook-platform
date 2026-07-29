/**
 * =============================================================================
 * PBOS Kernel
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4002 Kernel Services
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   The Kernel is the constitutional execution foundation of PBOS.
 *
 *   Every constitutional subsystem executes through this class.
 *
 *   The Kernel coordinates execution.
 *
 *   The Kernel never performs application business logic.
 *
 * =============================================================================
 */

import { KernelContext } from "./context";
import { KernelServices } from "./services";

export interface KernelOptions {
  readonly context: KernelContext;
  readonly services: KernelServices;
}

export class Kernel {
  public readonly context: KernelContext;
  public readonly services: KernelServices;

  public constructor(options: KernelOptions) {
    this.context = options.context;
    this.services = options.services;
  }

  /**
   * Boot the PBOS Kernel.
   */
  public async boot(): Promise<void> {
    await this.services.lifecycle.startup();
  }

  /**
   * Execute one constitutional runtime cycle.
   */
  public async execute(): Promise<void> {
    await this.services.validation.validate();

    await this.services.scheduler.schedule();

    await this.services.state.synchronize();

    await this.services.events.publish("kernel.execution.completed");
  }

  /**
   * Shut down the Kernel.
   */
  public async shutdown(): Promise<void> {
    await this.services.lifecycle.shutdown();
  }
}
