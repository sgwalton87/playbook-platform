/**
 * =============================================================================
 * PBOS Kernel Engine Tests
 * =============================================================================
 *
 * Authority:
 *   - PPS-4013 Kernel Certification
 *
 * Purpose:
 *   Verifies constitutional Kernel execution.
 *
 * =============================================================================
 */

import { describe, expect, it, vi } from "vitest";

import { DefaultKernelEngine } from "./kernel-engine";

describe("DefaultKernelEngine", () => {
  it("boots, executes, and shuts down the Kernel", async () => {
    const kernel = {
      boot: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    const engine = new DefaultKernelEngine(
      kernel as never,
    );

    await engine.execute({
      identity: {
        runtimeId: "runtime",
        executionId: "execution",
        sessionId: "session",
      },
      environment: {
        mode: "test",
        version: "1.0.0",
        startedAt: new Date(),
      },
    });

    expect(kernel.boot).toHaveBeenCalledTimes(1);
    expect(kernel.execute).toHaveBeenCalledTimes(1);
    expect(kernel.shutdown).toHaveBeenCalledTimes(1);
  });
});
