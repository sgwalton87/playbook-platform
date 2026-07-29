/**
 * =============================================================================
 * PBOS Default Context Provider
 * =============================================================================
 *
 * Authority:
 *   - PPS-4005 Kernel State Management
 *
 * Purpose:
 *   Produces the default immutable Kernel context.
 *
 * =============================================================================
 */

import {
  KernelContext,
  createKernelContext,
} from "../context";

export function createDefaultContext(): Readonly<KernelContext> {
  return createKernelContext({
    repository: {
      repositoryId: "unknown",
      branch: "unknown",
      commit: "unknown",
    },
    runtime: {
      runtimeId: "default",
      environment: "development",
      startedAt: new Date(),
    },
    execution: {
      executionId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
    },
  });
}
