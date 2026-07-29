import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Artifacts, Runtime } from "../kernel";

const mocks = vi.hoisted(() => ({
  runKernel: vi.fn(),
  runExecution: vi.fn(),
  loadAuthorization: vi.fn(),
}));

vi.mock("../engine/kernel-repository-adapter", () => ({
  runRepositoryKernel: mocks.runKernel,
}));

vi.mock("../execution", () => ({
  runExecutionEngine: mocks.runExecution,
}));

vi.mock("../execution/authorization", () => ({
  loadExecutionAuthorizationOrUndefined: mocks.loadAuthorization,
}));

import {
  loadKernelRuntimeHistory,
  PBOSKernelRuntime,
} from "./kernel-runtime";

const roots: string[] = [];

function root(): string {
  const created = mkdtempSync(path.join(tmpdir(), "pbos-kernel-runtime-"));
  roots.push(created);
  return created;
}

function certifiedKernel() {
  return {
    executionId: "KERNEL-EXECUTION-1",
    version: "1.0.0",
    status: "CERTIFIED",
    decision: {
      selectedObjectiveId: "OBJECTIVE-1",
      rationale: ["Eligible objective selected."],
    },
    plan: {
      objectiveId: "OBJECTIVE-1",
      gateId: "GATE-1",
      tasks: ["task"],
      digest: "plan-digest",
    },
    transition: {
      objectiveId: "OBJECTIVE-1",
      from: "ELIGIBLE",
      to: "PLANNED",
      evidence: ["plan-digest"],
    },
    certification: {
      status: "CERTIFIED",
      findings: [],
      digest: "kernel-certification",
    },
    report: { markdown: "certified", digest: "report" },
    events: [
      {
        stage: "validation",
        status: "PASS",
        validator: "kernel.validation.v1",
        outputDigest: "validation-digest",
      },
    ],
  };
}

describe("PBOS kernel runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runKernel.mockResolvedValue(certifiedKernel());
    mocks.loadAuthorization.mockReturnValue({
      id: "AUTHORIZATION-1",
      status: "AUTHORIZED",
    });
    mocks.runExecution.mockReturnValue({
      status: "READY",
      gate: "GATE-1",
      tasks: ["task"],
    });
  });

  afterEach(() => {
    for (const directory of roots.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("prohibits anonymous execution before runtime construction", async () => {
    await expect(
      new PBOSKernelRuntime().execute({ rootDir: root(), actorId: " " })
    ).rejects.toThrow("Anonymous kernel execution is prohibited.");
    expect(mocks.runKernel).not.toHaveBeenCalled();
  });

  it("certifies and preserves the complete successful execution envelope", async () => {
    const repositoryRoot = root();
    const result = await new PBOSKernelRuntime().execute({
      rootDir: repositoryRoot,
      actorId: "operator-1",
    });

    expect(result.successful).toBe(true);
    expect(result.envelope.certification?.status).toBe("CERTIFIED");
    expect(result.envelope.authorizationId).toBe("AUTHORIZATION-1");
    expect(result.envelope.transitionHistory.map(({ to }) => to)).toEqual([
      "BOOTING",
      "READY",
      "EXECUTING",
      "CERTIFYING",
      "SHUTTING_DOWN",
      "STOPPED",
    ]);
    expect(
      result.envelope.transitionHistory.every(
        (transition) =>
          transition.executionId === result.envelope.executionId &&
          transition.requestedTransition === transition.to &&
          transition.approvedTransition === transition.to &&
          transition.actorId === "operator-1" &&
          transition.authorizationId.length > 0
      )
    ).toBe(true);
    expect(result.envelope.metrics.executionCount).toBe(1);
    expect(result.envelope.metrics.successCount).toBe(1);

    const stored = loadKernelRuntimeHistory(repositoryRoot);
    expect(stored).not.toBeNull();
    if (!stored) throw new Error("Expected runtime history.");
    expect(stored.history).toHaveLength(1);
    expect(stored.latest.id).toBe(result.envelope.id);
  });

  it("fails closed when authorization is not approved", async () => {
    mocks.loadAuthorization.mockReturnValue({
      id: "AUTHORIZATION-1",
      status: "PENDING",
    });

    const result = await new PBOSKernelRuntime().execute({
      rootDir: root(),
      actorId: "operator-1",
    });

    expect(result.successful).toBe(false);
    expect(result.envelope.certification?.status).toBe("REJECTED");
    expect(result.envelope.errors).toContain(
      "Execution authorization is not AUTHORIZED."
    );
    expect(mocks.runExecution).not.toHaveBeenCalled();
  });

  it("records shutdown and rejected evidence after kernel failure", async () => {
    mocks.runKernel.mockResolvedValue({
      ...certifiedKernel(),
      plan: null,
      transition: null,
      certification: {
        status: "REJECTED",
        findings: ["CONTEXT_INVALID"],
        digest: "rejected",
      },
    });

    const repositoryRoot = root();
    const result = await new PBOSKernelRuntime().execute({
      rootDir: repositoryRoot,
      actorId: "operator-1",
    });

    expect(result.successful).toBe(false);
    expect(result.envelope.transitionHistory.map(({ to }) => to)).toEqual([
      "BOOTING",
      "READY",
      "FAILED",
      "SHUTTING_DOWN",
      "STOPPED",
    ]);
    expect(mocks.runExecution).not.toHaveBeenCalled();
    const stored = loadKernelRuntimeHistory(repositoryRoot);
    expect(stored).not.toBeNull();
    if (!stored) throw new Error("Expected runtime history.");
    expect(stored.history).toHaveLength(1);
    expect(stored.history[0].certification?.status).toBe("REJECTED");
  });

  it("preserves an interrupted draft as recovered evidence", async () => {
    const repositoryRoot = root();
    mocks.runKernel.mockImplementationOnce(() => {
      throw new Error("process interrupted");
    });
    await new PBOSKernelRuntime().execute({
      rootDir: repositoryRoot,
      actorId: "operator-1",
    });

    const first = loadKernelRuntimeHistory(repositoryRoot);
    expect(first).not.toBeNull();
    if (!first) throw new Error("Expected runtime history.");
    Runtime.save(
      path.join(repositoryRoot, Artifacts.kernelExecutionHistory),
      {
        ...first,
        latest: {
          ...first.latest,
          outcome: "IN_PROGRESS",
          certification: null,
        },
      },
      "kernel-runtime"
    );

    const result = await new PBOSKernelRuntime().execute({
      rootDir: repositoryRoot,
      actorId: "recovery-operator",
    });
    const stored = loadKernelRuntimeHistory(repositoryRoot);
    expect(stored).not.toBeNull();
    if (!stored) throw new Error("Expected runtime history.");

    expect(result.successful).toBe(true);
    expect(result.envelope.recoveryActions).toHaveLength(1);
    expect(stored.history.map(({ outcome }) => outcome)).toEqual([
      "FAILED",
      "RECOVERED",
      "SUCCEEDED",
    ]);
  });
});
