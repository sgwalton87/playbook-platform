/**
 * =============================================================================
 * PBOS Kernel Contract
 * =============================================================================
 *
 * Authority:
 *   - PPS-4004 Kernel APIs
 *   - PPS-4001 Kernel Architecture
 *
 * Purpose:
 *   Defines the constitutional contract implemented by every PBOS Kernel.
 *
 * =============================================================================
 */

export interface KernelContract {
  /**
   * Initialize the Kernel.
   */
  boot(): Promise<void>;

  /**
   * Execute one constitutional runtime cycle.
   */
  execute(): Promise<void>;

  /**
   * Gracefully terminate the Kernel.
   */
  shutdown(): Promise<void>;
}
