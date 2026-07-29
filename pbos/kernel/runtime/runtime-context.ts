/**
 * =============================================================================
 * PBOS Runtime Context
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *   - PPS-4005 Kernel State Management
 *
 * Purpose:
 *   Captures immutable runtime metadata for a Kernel execution.
 *
 * =============================================================================
 */

export interface RuntimeIdentity {
  readonly runtimeId: string;
  readonly executionId: string;
  readonly sessionId: string;
}

export interface RuntimeEnvironment {
  readonly mode: string;
  readonly version: string;
  readonly startedAt: Date;
}

export interface RuntimeContext {
  readonly identity: RuntimeIdentity;
  readonly environment: RuntimeEnvironment;
}

export function freezeRuntimeContext(
  context: RuntimeContext,
): Readonly<RuntimeContext> {
  return Object.freeze(context);
}
