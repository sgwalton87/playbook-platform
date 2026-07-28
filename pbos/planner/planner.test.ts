import { describe, expect, it } from "vitest";
import { buildDependencyGraph } from "./dependency-graph";
import { evaluateGateEligibility } from "./eligibility";
import { selectOneGate } from "./gate-selector";
import type {
  GateDefinition,
  PlannerEnvironment,
} from "./types";

const gate = (
  id: string,
  overrides: Partial<GateDefinition> = {}
): GateDefinition => ({
  id,
  title: id,
  description: `Constitutional work for ${id}.`,
  status: "in_progress",
  priority: 100,
  lifecycle_stage: 1,
  dependencies: [],
  produces: [`docs/${id}.md`],
  requires: [],
  blocking_conditions: [],
  completion_state: "pending",
  handbook_refs: [],
  tasks: [],
  definition_of_done: [],
  validation: [],
  next_gate: null,
  ...overrides,
});

const environment = (
  overrides: Partial<PlannerEnvironment> = {}
): PlannerEnvironment => ({
  contextValid: true,
  contextErrors: [],
  validationPassed: true,
  validationGate: "PBOS-NEXT-001",
  releaseState: "PROMOTION_COMPLETE",
  releasePermitsExecution: true,
  artifacts: new Map(),
  ...overrides,
});

describe("constitutional planning engine", () => {
  it("selects exactly one gate by stage, priority, then identifier", () => {
    const gates = [
      gate("PBOS-Z-001", { priority: 200, lifecycle_stage: 2 }),
      gate("PBOS-NEXT-001"),
    ];
    const graph = buildDependencyGraph(gates);
    const evaluations = gates.map((item) =>
      evaluateGateEligibility(item, graph, environment())
    );

    expect(selectOneGate(evaluations)?.gate.id).toBe("PBOS-NEXT-001");
  });

  it("fails closed on incomplete dependencies", () => {
    const gates = [
      gate("PBOS-FIRST-001"),
      gate("PBOS-NEXT-001", {
        dependencies: ["PBOS-FIRST-001"],
      }),
    ];
    const graph = buildDependencyGraph(gates);
    const result = evaluateGateEligibility(
      gates[1],
      graph,
      environment()
    );

    expect(result.eligible).toBe(false);
    expect(result.reasons.map(({ code }) => code)).toContain(
      "DEPENDENCIES_INCOMPLETE"
    );
  });

  it("fails closed when context, release, validation, or artifacts block", () => {
    const item = gate("PBOS-NEXT-001", {
      requires: ["pbos/runtime/required.json"],
    });
    const graph = buildDependencyGraph([item]);
    const result = evaluateGateEligibility(
      item,
      graph,
      environment({
        artifacts: new Map([
          [
            "pbos/runtime/required.json",
            {
              path: "pbos/runtime/required.json",
              valid: false,
              digest: null,
              gateId: null,
              errors: ["Artifact does not exist."],
            },
          ],
        ]),
        contextValid: false,
        contextErrors: ["Repository identity mismatches."],
        validationPassed: false,
        releasePermitsExecution: false,
      })
    );

    expect(result.eligible).toBe(false);
    expect(result.reasons.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "ARTIFACTS_MISSING",
        "CONTEXT_INVALID",
        "VALIDATION_FAILED",
        "RELEASE_STATE_BLOCKED",
      ])
    );
  });

  it("rejects validation for a different gate", () => {
    const item = gate("PBOS-NEXT-001");
    const graph = buildDependencyGraph([item]);
    const result = evaluateGateEligibility(
      item,
      graph,
      environment({ validationGate: "PBOS-OTHER-001" })
    );

    expect(result.eligible).toBe(false);
    expect(result.reasons.map(({ code }) => code)).toContain(
      "VALIDATION_GATE_MISMATCH"
    );
  });

  it("reports missing dependencies and cycles deterministically", () => {
    const graph = buildDependencyGraph([
      gate("PBOS-A-001", { dependencies: ["PBOS-B-001"] }),
      gate("PBOS-B-001", {
        dependencies: ["PBOS-A-001", "PBOS-MISSING-001"],
      }),
    ]);

    expect(graph.missingDependencies).toEqual([
      {
        gateId: "PBOS-B-001",
        dependencyId: "PBOS-MISSING-001",
      },
    ]);
    expect(graph.cycles).toEqual([
      ["PBOS-A-001", "PBOS-B-001", "PBOS-A-001"],
    ]);
  });

  it("preserves declared blocking conditions", () => {
    const item = gate("PBOS-NEXT-001", {
      blocking_conditions: ["Constitutional review pending"],
    });
    const result = evaluateGateEligibility(
      item,
      buildDependencyGraph([item]),
      environment()
    );

    expect(result.eligible).toBe(false);
    expect(result.reasons.map(({ code }) => code)).toContain(
      "GATE_BLOCKED"
    );
  });
});
