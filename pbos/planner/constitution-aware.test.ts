import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import { planNextAction, PlanningError } from "./constitution-aware";
import type { PlanningGate, PlanningInput } from "./constitution-aware-contracts";

function runtimeContext() {
  const content = "canonical planning authority";
  return compileContext({
    sources: [{ identifier: "PPS-800", title: "PBOS Engine Architecture", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-800_PBOS_ENGINE_ARCHITECTURE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-800", location: "docs/PPS/08_PBOS_ENGINE/PPS-800_PBOS_ENGINE_ARCHITECTURE.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
}

const completeGate: PlanningGate = { identifier: "PBOS-BASE-001", objective: "Establish the planning prerequisite.", dependencies: [], status: "complete", priority: 1, validationRequirements: [], authorityReferences: ["PPS-800"], evidenceReferences: ["evidence:base"] };

function gate(identifier: string, priority: number): PlanningGate {
  return { identifier, objective: `Plan ${identifier}`, dependencies: [completeGate.identifier], status: "ready", priority, validationRequirements: ["lint", "test"], authorityReferences: ["PPS-800"], evidenceReferences: [`gate:${identifier}`] };
}

function input(gates: PlanningGate[] = [completeGate, gate("PBOS-LOW-001", 10), gate("PBOS-HIGH-001", 100)]): PlanningInput {
  return { runtimeContext: runtimeContext(), gates, repository: { branch: "work", commit: "56830a5", workingTree: "clean", validationResults: [{ identifier: "lint", status: "passed", evidence: ["npm run lint"] }, { identifier: "test", status: "passed", evidence: ["npm test"] }] } };
}

function failureCodes(planningInput: PlanningInput): string[] {
  try { planNextAction(planningInput); return []; } catch (error) {
    expect(error).toBeInstanceOf(PlanningError);
    return (error as PlanningError).failures.map((item) => item.code);
  }
}

describe("constitution-aware PBOS planning", () => {
  it("selects the highest-priority eligible gate deterministically", () => {
    const first = planNextAction(input());
    expect(planNextAction(input())).toEqual(first);
    expect(first.selectedGate).toBe("PBOS-HIGH-001");
    expect(first.satisfiedDependencies).toEqual(["PBOS-BASE-001"]);
    expect(first.confidenceClassification).toBe("HIGH");
  });

  it("respects dependency completion", () => {
    const dependent = gate("PBOS-DEPENDENT-001", 200);
    dependent.dependencies = ["PBOS-INCOMPLETE-001"];
    const incomplete = { ...completeGate, identifier: "PBOS-INCOMPLETE-001", status: "ready" as const };
    expect(planNextAction(input([completeGate, incomplete, dependent, gate("PBOS-ELIGIBLE-001", 10)])).selectedGate).toBe("PBOS-ELIGIBLE-001");
  });

  it("does not select a blocked gate", () => {
    const blocked = gate("PBOS-BLOCKED-001", 999);
    blocked.status = "blocked";
    expect(planNextAction(input([completeGate, blocked])).selectedGate).toBeNull();
  });

  it("does not select a gate without constitutional authority", () => {
    const unauthorized = gate("PBOS-UNAUTHORIZED-001", 999);
    unauthorized.authorityReferences = ["PPS-999"];
    expect(planNextAction(input([completeGate, unauthorized])).selectedGate).toBeNull();
  });

  it("rejects missing Runtime Context", () => {
    const planningInput = input();
    planningInput.runtimeContext = null;
    expect(failureCodes(planningInput)).toContain("MISSING_CONTEXT");
  });

  it("rejects unresolved governance exclusions", () => {
    const planningInput = input();
    planningInput.runtimeContext!.exclusionRecords.push({ artifact: "PPS-300", reason: "PENDING_GOVERNANCE" });
    expect(failureCodes(planningInput)).toContain("UNRESOLVED_GOVERNANCE");
  });

  it("reports a missing gate dependency instead of ignoring it", () => {
    const missing = gate("PBOS-MISSING-DEP-001", 100);
    missing.dependencies = ["PBOS-NOT-FOUND"];
    const decision = planNextAction(input([missing]));
    expect(decision.selectedGate).toBeNull();
    expect(decision.blockingDependencies).toEqual(["PBOS-NOT-FOUND"]);
  });

  it("uses the gate identifier as a stable priority tie-breaker", () => {
    expect(planNextAction(input([completeGate, gate("PBOS-B-001", 50), gate("PBOS-A-001", 50)])).selectedGate).toBe("PBOS-A-001");
  });
});
