import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PBOSWorld } from "../world";

const mocks = vi.hoisted(() => ({
  engineRun: vi.fn(),
  addBlocker: vi.fn(),
  verifyContext: vi.fn(),
}));

vi.mock("../engine", () => ({
  getEnginesForPhase: () => [
    {
      id: "ExecutionEngine",
      run: mocks.engineRun,
    },
  ],
}));

vi.mock("../context", () => ({
  verifyStoredRepositoryContext: mocks.verifyContext,
}));

vi.mock("./state-manager", () => ({
  addBlocker: mocks.addBlocker,
}));

import { runPhase } from "./phase-runner";

const world: PBOSWorld = {
  generatedAt: "2026-07-28T00:00:00.000Z",
};

describe("PBOS runtime context enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks the execution phase when context is invalid", async () => {
    mocks.verifyContext.mockReturnValue({
      valid: false,
      errors: ["Repository commit changed."],
    });

    const result = await runPhase("execute", world);

    expect(mocks.engineRun).not.toHaveBeenCalled();
    expect(mocks.addBlocker).toHaveBeenCalledWith(
      "Repository commit changed."
    );
    expect(result.engines[0].result.success).toBe(false);
  });

  it("preserves execution flow when context is valid", async () => {
    mocks.verifyContext.mockReturnValue({
      valid: true,
      errors: [],
    });
    mocks.engineRun.mockResolvedValue({
      success: true,
      message: "Execution completed.",
    });

    const result = await runPhase("execute", world);

    expect(mocks.engineRun).toHaveBeenCalledOnce();
    expect(mocks.addBlocker).not.toHaveBeenCalled();
    expect(result.engines[0].result.success).toBe(true);
  });
});
