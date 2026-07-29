/**
 * =============================================================================
 * PBOS Kernel Planner Adapter
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Adapts existing PBOS planning engines for Kernel execution.
 *
 * =============================================================================
 */

export interface Planner {
  plan(): Promise<void>;
}

export class KernelPlannerAdapter {
  public constructor(
    private readonly planner: Planner,
  ) {}

  public async execute(): Promise<void> {
    await this.planner.plan();
  }
}
