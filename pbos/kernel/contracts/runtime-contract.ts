/**
 * =============================================================================
 * PBOS Runtime Contract
 * =============================================================================
 *
 * Authority:
 *   - PPS-4003 Kernel Lifecycle
 *   - PPS-4004 Kernel APIs
 *
 * Purpose:
 *   Defines the execution contract for all constitutional PBOS runtimes.
 *
 * =============================================================================
 */

export interface RuntimeContract {
  /**
   * Execute the configured runtime.
   */
  run(): Promise<void>;

  /**
   * Report runtime health.
   */
  health(): Promise<boolean>;
}
