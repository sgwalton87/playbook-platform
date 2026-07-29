/**
 * =============================================================================
 * PBOS Kernel State Coordinator
 * =============================================================================
 *
 * Authority:
 *   - PPS-4005 Kernel State Management
 *
 * Purpose:
 *   Coordinates constitutional state transitions for the PBOS Kernel.
 *
 * The Kernel never mutates constitutional state directly.
 *
 * All state transitions must be delegated to authorized State Writers.
 *
 * =============================================================================
 */

export interface KernelStateSnapshot {
  readonly executionId: string;

  readonly timestamp: Date;

  readonly status: string;
}

export interface StateWriter {
  write(
    previous: KernelStateSnapshot,
    next: KernelStateSnapshot,
  ): Promise<void>;
}

export class KernelStateCoordinator {
  public constructor(
    private readonly writer: StateWriter,
  ) {}

  public async synchronize(
    previous: KernelStateSnapshot,
    next: KernelStateSnapshot,
  ): Promise<void> {
    if (previous.executionId !== next.executionId) {
      throw new Error(
        "State synchronization requires identical execution identifiers.",
      );
    }

    await this.writer.write(previous, next);
  }
}
