/**
 * =============================================================================
 * PBOS Kernel Command
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Defines the constitutional command executed by the Kernel.
 *
 * =============================================================================
 */

import { ExecutionContext } from "./execution-context";

export interface KernelCommand {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  execute(
    context: ExecutionContext,
  ): Promise<void>;
}
