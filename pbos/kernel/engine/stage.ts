/**
 * =============================================================================
 * PBOS Execution Stage
 * =============================================================================
 *
 * Authority:
 *   - PPS-4003 Kernel Lifecycle
 *   - PPS-4006 Kernel Scheduling
 *
 * Purpose:
 *   Defines a single constitutional stage executed by the PBOS Kernel.
 *
 * =============================================================================
 */

import { ExecutionContext } from "./execution-context";

export interface ExecutionStage {
  readonly id: string;

  readonly name: string;

  execute(
    context: ExecutionContext,
  ): Promise<void>;
}
