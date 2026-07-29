import { describe, expect, it } from "vitest";
import { artifactDigest } from "../identity";
import { DependencyGraph } from "./dependency-graph";
import { ConstitutionalExecutionKernel } from "./kernel";
import type { KernelInput, KernelObjective } from "./types";

function objective(
  id: string,
  overrides: Partial<KernelObjective> = {}
): KernelObjective {
  return {
    id,
    description: id,
    state: "READY",
    parentId: null,
    dependencyIds: [],
    constitutionalOrder: 1,
    priority: {
      constitutional: 80,
      strategic: 80,
      engineering: 80,
      business: 80,
      operational: 80,
    },
    risk: 20,
    estimatedEffort: 5,
    criticalPath: false,
    authority: "PBOS Constitution",
    blockers: [],
    requiredApprovals: [],
    approvals: [],
    validations: ["test"],
    artifacts: [],
    outputs: ["evidence"],
    successCriteria: ["validated"],
    failureCriteria: ["validation failed"],
    rollback: ["preserve current state"],
    ...overrides,
  };
}

function input(objectives = [objective("OBJ-001")]): KernelInput {
  const registry = {
    id: "REGISTRY",
    rootObjectiveIds: objectives.filter((item) => item.parentId === null).map((item) => item.id),
    objectives,
  };
  return {
    observedAt: "2026-01-01T00:00:00.000Z",
    repository: {
      root: "/repo",
      remote: "git@example/repo.git",
      head: "abc",
      branch: "main",
      contentDigest: "content",
      valid: true,
      errors: [],
    },
    runtime: {
      engineVersion: "3.0.0",
      mode: "governed",
      activeGate: null,
      completedGates: [],
      releaseState: "PROMOTION_COMPLETE",
      valid: true,
      errors: [],
    },
    constitution: { id: "CONSTITUTION", digest: "constitution", uri: "docs" },
    registry: {
      ...registry,
      digest: artifactDigest(registry),
    },
    priorityWeights: {
      constitutional: 30,
      strategic: 25,
      engineering: 20,
      business: 15,
      operational: 10,
    },
  };
}

describe("ConstitutionalExecutionKernel", () => {
  it("produces byte-identical results for identical inputs", () => {
    const kernel = new ConstitutionalExecutionKernel();
    expect(kernel.plan(input())).toEqual(kernel.plan(input()));
    expect(kernel.plan(input()).report.json).toBe(kernel.plan(input()).report.json);
  });

  it("executes every constitutional stage in order", () => {
    const result = new ConstitutionalExecutionKernel().plan(input());
    expect(result.events.map((event) => event.stage)).toEqual([
      "REPOSITORY_CONTEXT",
      "REPOSITORY_VALIDATION",
      "CONSTITUTION_VALIDATION",
      "OBJECTIVE_REGISTRY",
      "OBJECTIVE_STATE",
      "DEPENDENCY_GRAPH",
      "ELIGIBILITY",
      "PRIORITY",
      "RISK",
      "DECISION",
      "EXECUTION_PLAN",
      "CERTIFICATION",
      "REPORTING",
      "STATE_TRANSITION",
    ]);
    expect(result.status).toBe("CERTIFIED");
    expect(result.transition?.from).toBe("READY");
  });

  it("selects only READY objectives and preserves deterministic tie breaking", () => {
    const result = new ConstitutionalExecutionKernel().plan(
      input([
        objective("OBJ-B"),
        objective("OBJ-A"),
        objective("OBJ-X", { state: "IN_PROGRESS", constitutionalOrder: 0 }),
      ])
    );
    expect(result.decision.selectedObjectiveId).toBe("OBJ-A");
    expect(result.decision.blockedObjectiveIds).toContain("OBJ-X");
  });

  it("fails closed for invalid repository context", () => {
    const value = input();
    value.repository.valid = false;
    value.repository.errors = ["HEAD mismatch"];
    const result = new ConstitutionalExecutionKernel().plan(value);
    expect(result.status).toBe("BLOCKED");
    expect(result.certification.findings).toContain("REPOSITORY:HEAD mismatch");
    expect(result.plan).toBeNull();
    expect(result.transition).toBeNull();
    expect(
      result.events
        .slice(result.events.findIndex((event) => event.status === "FAIL"))
        .every((event) => event.status === "FAIL")
    ).toBe(true);
  });

  it("rejects registry content identity mismatch", () => {
    const value = input();
    value.registry.digest = "stale";
    const result = new ConstitutionalExecutionKernel().plan(value);
    expect(result.status).toBe("BLOCKED");
    expect(result.plan).toBeNull();
    expect(result.certification.findings).toContain("REGISTRY_DIGEST_MISMATCH");
  });

  it("does not mutate input while producing a transition request", () => {
    const value = input();
    const before = JSON.stringify(value);
    const result = new ConstitutionalExecutionKernel().plan(value);
    expect(JSON.stringify(value)).toBe(before);
    expect(result.transition).toMatchObject({ from: "READY", to: "PLANNED" });
  });

  it("requires completed dependencies", () => {
    const result = new ConstitutionalExecutionKernel().plan(
      input([
        objective("ROOT", { state: "READY" }),
        objective("CHILD", {
          parentId: "ROOT",
          dependencyIds: ["ROOT"],
          constitutionalOrder: 0,
        }),
      ])
    );
    expect(result.decision.selectedObjectiveId).toBe("ROOT");
    expect(result.decision.blockedObjectiveIds).toContain("CHILD");
  });
});

describe("DependencyGraph", () => {
  it("detects duplicates, missing references, cycles, orphans, and unreachable nodes", () => {
    const graph = new DependencyGraph().validate(
      [
        objective("ROOT", { dependencyIds: ["CYCLE"] }),
        objective("CYCLE", { parentId: "ROOT", dependencyIds: ["ROOT"] }),
        objective("ORPHAN"),
        objective("MISSING", { parentId: "NOPE", dependencyIds: ["NOPE"], childIds: ["NOPE"] }),
        objective("ROOT"),
      ],
      ["ROOT"]
    );
    const codes = graph.findings.map((finding) => finding.code);
    expect(graph.valid).toBe(false);
    expect(codes).toEqual(
      expect.arrayContaining([
        "DUPLICATE_ID",
        "MISSING_PARENT",
        "MISSING_DEPENDENCY",
        "MISSING_CHILD",
        "CYCLE",
        "ORPHAN",
        "UNREACHABLE",
      ])
    );
  });
});
