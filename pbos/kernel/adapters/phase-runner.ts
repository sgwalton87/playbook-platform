/**
 * =============================================================================
 * PBOS Kernel Phase Runner Adapter
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *   - PPS-4003 Kernel Lifecycle
 *
 * Purpose:
 *   Adapts the existing PBOS phase runner to the constitutional Kernel.
 *
 * =============================================================================
 */

export interface PhaseRunner {
  run(): Promise<void>;
}

export class KernelPhaseRunnerAdapter {
  public constructor(
    private readonly runner: PhaseRunner,
  ) {}

  public async execute(): Promise<void> {
    await this.runner.run();
  }
}
