import type { EngineResult } from "./types";

/**
 * Factory helpers for standardized PBOS engine results.
 */
export class Results {
  /**
   * Create a successful engine result.
   */
  static success<T>(
    engine: string,
    data?: T,
    runtimeArtifact?: string,
    message?: string,
    durationMs?: number
  ): EngineResult<T> {
    return {
      success: true,
      engine,
      data,
      runtimeArtifact,
      message,
      durationMs,
    };
  }

  /**
   * Create a failed engine result.
   */
  static failure(
    engine: string,
    message: string,
    durationMs?: number
  ): EngineResult {
    return {
      success: false,
      engine,
      message,
      durationMs,
    };
  }
}
