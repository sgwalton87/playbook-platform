/**
 * =============================================================================
 * PBOS Kernel Runtime Adapter Tests
 * =============================================================================
 */

import { describe, expect, it, vi } from "vitest";

import { KernelRuntimeAdapter } from "./kernel-runtime-adapter";

describe("KernelRuntimeAdapter", () => {
  it("delegates execution to the Kernel Engine", async () => {
    const engine = {
      execute: vi.fn().mockResolvedValue({
        executionId: "exec-001",
        status: "SUCCESS",
      }),
    };

    const adapter = new KernelRuntimeAdapter(
      engine as never,
    );

    await expect(
      adapter.execute({
        executionId: "exec-001",
        command: "next",
        startedAt: new Date(),
        initiatedBy: "test",
        metadata: {},
      }),
    ).resolves.not.toThrow();

    expect(engine.execute).toHaveBeenCalledTimes(1);
  });
});
