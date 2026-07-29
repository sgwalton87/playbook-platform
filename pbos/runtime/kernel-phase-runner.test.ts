/**
 * =============================================================================
 * PBOS Kernel Phase Runner Tests
 * =============================================================================
 */

import { describe, expect, it, vi } from "vitest";

import { KernelPhaseRunner } from "./kernel-phase-runner";

describe("KernelPhaseRunner", () => {
  it("executes through the Kernel Engine", async () => {
    const engine = {
      execute: vi.fn().mockResolvedValue({
        executionId: "execution",
        status: "SUCCESS",
      }),
    };

    const runner = new KernelPhaseRunner(
      engine as never,
    );

    await expect(
      runner.run({
        executionId: "execution",
        command: "next",
        startedAt: new Date(),
        initiatedBy: "test",
        metadata: {},
      }),
    ).resolves.not.toThrow();
  });
});
