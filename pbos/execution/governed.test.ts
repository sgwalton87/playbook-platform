import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { PlanningDecision } from "../planner";
import { createGovernedExecutionPlan, ExecutionPlanningError } from "./governed";
import type { GovernedExecutionInput } from "./governed-contracts";

function context() {
  const content = "canonical execution authority";
  return compileContext({
    sources: [{ identifier: "PPS-802", title: "Execution Engine", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-802_EXECUTION_ENGINE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified", constraints: [{ id: "PBOS-CONSTRAINT-001", kind: "approval", description: "Require human approval." }] }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-802", location: "docs/PPS/08_PBOS_ENGINE/PPS-802_EXECUTION_ENGINE.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
}

const decision: PlanningDecision = {
  selectedGate: "PBOS-ENGINE-EXECUTION-001",
  reasoning: ["Eligible under PPS-802."],
  satisfiedDependencies: ["PBOS-ENGINE-PLANNING-001"],
  blockingDependencies: [],
  requiredValidations: ["lint", "test"],
  confidenceClassification: "HIGH",
  evidenceReferences: ["authority:PPS-802", "context:verified"],
};

function input(): GovernedExecutionInput {
  return {
    runtimeContext: context(),
    planningDecision: structuredClone(decision),
    gate: {
      identifier: "PBOS-ENGINE-EXECUTION-001",
      objective: "Build a governed execution contract.",
      status: "ready",
      dependencies: ["PBOS-ENGINE-PLANNING-001"],
      requiredActions: ["Create an auditable execution plan."],
      affectedSystems: ["PBOS Execution Engine"],
      validationRequirements: ["lint", "test"],
      rollbackExpectations: ["Discard the unexecuted plan."],
      evidenceRequirements: ["Execution plan digest"],
      completionCriteria: ["Plan is deterministic and approved."],
    },
    governance: { approvalStatus: "approved", approvalIdentifier: "APPROVAL-001", evidenceReferences: ["governance:APPROVAL-001"], blockers: [], exclusions: [] },
    repository: { branch: "work", commit: "dcec06e", workingTree: "clean", validationResults: [{ identifier: "lint", status: "passed", evidence: ["npm run lint"] }, { identifier: "test", status: "passed", evidence: ["npm test"] }] },
  };
}

function failureCodes(value: GovernedExecutionInput): string[] {
  try { createGovernedExecutionPlan(value); return []; } catch (error) {
    expect(error).toBeInstanceOf(ExecutionPlanningError);
    return (error as ExecutionPlanningError).failures.map((item) => item.code);
  }
}

describe("governed PBOS execution planning", () => {
  it("creates a deterministic plan from an approved Planning Decision", () => {
    const first = createGovernedExecutionPlan(input());
    expect(createGovernedExecutionPlan(input())).toEqual(first);
    expect(first.sourceGate).toBe("PBOS-ENGINE-EXECUTION-001");
    expect(first.executionId).toMatch(/^PBOS-EXEC-[A-F0-9]{16}$/);
  });

  it("preserves evidence and inherits constitutional constraints", () => {
    const plan = createGovernedExecutionPlan(input());
    expect(plan.evidenceRequirements).toContain("authority:PPS-802");
    expect(plan.evidenceRequirements).toContain("governance:APPROVAL-001");
    expect(plan.constraints).toContain("PBOS-CONSTRAINT-001: Require human approval.");
  });

  it("rejects blocked gate execution", () => {
    const value = input();
    value.gate.status = "blocked";
    expect(failureCodes(value)).toContain("BLOCKED_EXECUTION");
  });

  it("rejects missing approval", () => {
    const value = input();
    value.governance.approvalStatus = "pending";
    value.governance.approvalIdentifier = null;
    expect(failureCodes(value)).toContain("MISSING_APPROVAL");
  });

  it("rejects invalid Runtime Context", () => {
    const value = input();
    value.runtimeContext!.contextDigest = "invalid";
    expect(failureCodes(value)).toContain("INVALID_CONTEXT");
  });

  it("rejects unresolved dependencies", () => {
    const value = input();
    value.planningDecision.satisfiedDependencies = [];
    expect(failureCodes(value)).toContain("UNRESOLVED_DEPENDENCY");
  });

  it("rejects a missing validation requirement", () => {
    const value = input();
    value.planningDecision.requiredValidations = ["lint"];
    expect(failureCodes(value)).toContain("MISSING_VALIDATION_REQUIREMENT");
  });
});
