/**
 * =============================================================================
 * PBOS Kernel Context
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *   - PPS-4005 Kernel State Management
 *
 * Purpose:
 *   Defines the immutable constitutional execution context for the PBOS Kernel.
 *
 * Every Kernel execution operates against a single immutable context.
 *
 * =============================================================================
 */

export interface RepositoryContext {
  readonly repositoryId: string;
  readonly branch: string;
  readonly commit: string;
}

export interface RuntimeContext {
  readonly runtimeId: string;
  readonly environment: string;
  readonly startedAt: Date;
}

export interface ExecutionContext {
  readonly executionId: string;
  readonly correlationId: string;
}

export interface KernelContext {
  readonly repository: RepositoryContext;
  readonly runtime: RuntimeContext;
  readonly execution: ExecutionContext;
}

export function createKernelContext(
  context: KernelContext,
): Readonly<KernelContext> {
  return Object.freeze(context);
}
