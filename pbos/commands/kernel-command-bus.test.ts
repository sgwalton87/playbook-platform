import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runKernel: vi.fn(),
  runRuntime: vi.fn(),
}));

vi.mock("../engine/kernel-repository-adapter", () => ({
  runRepositoryKernel: mocks.runKernel,
}));

vi.mock("../health/engine-health", () => ({
  getEngineHealth: vi.fn(),
  formatEngineHealth: vi.fn(),
}));

vi.mock("../runtime/kernel-runtime", () => ({
  runKernelRuntime: mocks.runRuntime,
}));

import {
  dispatchKernelCommand,
  isKernelCommand,
} from "./kernel-command-bus";

function blockedKernelResult() {
  return {
    status: "BLOCKED",
    decision: {
      selectedObjectiveId: null,
      rationale: ["Context invalid."],
    },
    plan: null,
    transition: null,
    certification: {
      status: "REJECTED",
      findings: ["REPOSITORY_CONTEXT_INVALID"],
    },
    report: {
      markdown: "blocked",
      digest: "report",
    },
  };
}

describe("kernel command bus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runKernel.mockResolvedValue(blockedKernelResult());
    mocks.runRuntime.mockResolvedValue({
      successful: false,
      envelope: { errors: ["REPOSITORY_CONTEXT_INVALID"] },
    });
  });

  it("recognizes only governed kernel commands", () => {
    expect(isKernelCommand("execute")).toBe(true);
    expect(isKernelCommand("unknown")).toBe(false);
  });

  it("never dispatches execution after failed kernel certification", async () => {
    const result = await dispatchKernelCommand("execute", "/repo", "actor-1");

    expect(result.successful).toBe(false);
    expect(mocks.runRuntime).toHaveBeenCalledWith({
      rootDir: "/repo",
      actorId: "actor-1",
    });
    expect(mocks.runKernel).not.toHaveBeenCalled();
  });

  it("uses one kernel evaluation for report output", async () => {
    const result = await dispatchKernelCommand("report", "/repo");

    expect(result.output).toBe("blocked");
    expect(mocks.runKernel).toHaveBeenCalledOnce();
  });
});
