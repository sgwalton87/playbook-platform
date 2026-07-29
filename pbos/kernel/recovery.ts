/**
 * =============================================================================
 * PBOS Kernel Recovery
 * =============================================================================
 *
 * Authority:
 *   - PPS-4011 Kernel Recovery
 *
 * Purpose:
 *   Coordinates constitutional recovery after recoverable failures.
 *
 * =============================================================================
 */

export enum RecoveryStatus {
  NOT_REQUIRED = "NOT_REQUIRED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface RecoveryStrategy {
  readonly id: string;
  readonly description: string;

  recover(error: Error): Promise<void>;
}

export class KernelRecoveryManager {
  public constructor(
    private readonly strategies: readonly RecoveryStrategy[],
  ) {}

  public async recover(error: Error): Promise<RecoveryStatus> {
    for (const strategy of this.strategies) {
      await strategy.recover(error);
    }

    return RecoveryStatus.COMPLETED;
  }
}
