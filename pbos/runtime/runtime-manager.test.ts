/**
 * =============================================================================
 * PBOS Runtime Manager Tests
 * =============================================================================
 */

import { describe, expect, it, vi } from "vitest";

import { RuntimeManager } from "./runtime-manager";
import { RuntimeRegistry } from "./runtime-registry";

describe("RuntimeManager", () => {
  it("executes a registered runtime", async () => {
    const runtime = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    const registry = new RuntimeRegistry();

    registry.register(
      "default",
      runtime as never,
    );

    const manager = new RuntimeManager(
      registry,
    );

    await manager.execute(
      "default",
      {
        executionId: "execution",
        command: "next",
        startedAt: new Date(),
        initiatedBy: "test",
        metadata: {},
      },
    );

    expect(
      runtime.execute,
    ).toHaveBeenCalledTimes(1);
  });
});
