/**
 * Shared PBOS Kernel Types
 */

/**
 * Standard engine execution result.
 */
export interface EngineResult<T = unknown> {
  success: boolean;
  engine: string;
  runtimeArtifact?: string;
  data?: T;
  message?: string;
  durationMs?: number;
}
