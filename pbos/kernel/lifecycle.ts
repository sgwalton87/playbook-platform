/**
 * =============================================================================
 * PBOS Kernel Lifecycle
 * =============================================================================
 *
 * Authority:
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Implements the constitutional lifecycle coordinator for the PBOS Kernel.
 *
 * The Lifecycle Manager guarantees that every Kernel execution follows the
 * canonical constitutional execution sequence.
 *
 * =============================================================================
 */

export enum KernelLifecycleState {
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  EXECUTING = "EXECUTING",
  SHUTTING_DOWN = "SHUTTING_DOWN",
  STOPPED = "STOPPED",
}

export interface KernelLifecycle {
  readonly state: KernelLifecycleState;

  startup(): Promise<void>;

  beginExecution(): Promise<void>;

  completeExecution(): Promise<void>;

  shutdown(): Promise<void>;
}

export class DefaultKernelLifecycle implements KernelLifecycle {
  public state: KernelLifecycleState =
    KernelLifecycleState.INITIALIZING;

  public async startup(): Promise<void> {
    this.state = KernelLifecycleState.READY;
  }

  public async beginExecution(): Promise<void> {
    if (this.state !== KernelLifecycleState.READY) {
      throw new Error(
        "Kernel execution cannot begin unless lifecycle is READY.",
      );
    }

    this.state = KernelLifecycleState.EXECUTING;
  }

  public async completeExecution(): Promise<void> {
    if (this.state !== KernelLifecycleState.EXECUTING) {
      throw new Error(
        "Kernel execution cannot complete unless EXECUTING.",
      );
    }

    this.state = KernelLifecycleState.READY;
  }

  public async shutdown(): Promise<void> {
    this.state = KernelLifecycleState.SHUTTING_DOWN;

    this.state = KernelLifecycleState.STOPPED;
  }
}
