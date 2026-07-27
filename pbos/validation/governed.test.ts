import { describe, expect, it } from "vitest";
import { compileContext, digestValue, sha256 } from "../context";
import { createGovernedExecutionPlan } from "../execution";
import type { PlanningDecision } from "../planner";
import { validateExecutionOutcome } from "./governed";
import type { GovernedValidationInput, ValidationEvidenceItem, ValidationType } from "./governed-contracts";

const requirement = (value: string, type: ValidationType): readonly [string, ValidationType] => [value, type];

function fixture(): GovernedValidationInput {
  const content = "canonical validation authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-804", title: "Validation Engine", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-804_VALIDATION_ENGINE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified", constraints: [{ id: "PBOS-CONSTRAINT-VAL", kind: "approval", description: "Preserve validation evidence." }] }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-804", location: "docs/PPS/08_PBOS_ENGINE/PPS-804_VALIDATION_ENGINE.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  const planningDecision: PlanningDecision = { selectedGate: "PBOS-ENGINE-VALIDATION-001", reasoning: ["Eligible."], satisfiedDependencies: ["PBOS-ENGINE-EXECUTION-001"], blockingDependencies: [], requiredValidations: ["build", "docs", "lint", "security", "test"], confidenceClassification: "HIGH", evidenceReferences: ["authority:PPS-804"] };
  const plan = createGovernedExecutionPlan({
    runtimeContext,
    planningDecision,
    gate: { identifier: "PBOS-ENGINE-VALIDATION-001", objective: "Validate completed work.", status: "ready", dependencies: ["PBOS-ENGINE-EXECUTION-001"], requiredActions: ["Evaluate execution evidence."], affectedSystems: ["PBOS Validation Engine"], validationRequirements: ["build", "docs", "lint", "security", "test"], rollbackExpectations: ["Retain prior validation state."], evidenceRequirements: ["Test and build evidence"], completionCriteria: ["Every requirement has evidence."] },
    governance: { approvalStatus: "approved", approvalIdentifier: "APPROVAL-VAL-001", evidenceReferences: ["approval-record"], blockers: [], exclusions: [] },
    repository: { branch: "work", commit: "a2c70b8", workingTree: "clean", validationResults: [] },
  });
  const requirements: Array<readonly [string, ValidationType]> = [
    ...plan.requiredValidations.map((item) => requirement(`validation:${item}`, "evidence")),
    ...plan.satisfiedDependencies.map((item) => requirement(`dependency:${item}`, "dependency")),
    ...plan.requiredActions.map((item) => requirement(`implementation:${item}`, "implementation")),
    ...plan.completionCriteria.map((item) => requirement(`completion:${item}`, "implementation")),
    ...plan.constraints.map((item) => requirement(`constitutional:${item}`, "constitutional")),
    requirement("release:readiness", "release"),
  ];
  const validationEvidence: ValidationEvidenceItem[] = requirements.map(([requirement, validationType], index) => ({ identifier: `EVIDENCE-${index + 1}`, requirement, validationType, status: "PASS", evidenceReferences: [`evidence:${index + 1}`], summary: `${requirement} passed.` }));
  return { runtimeContext, executionContract: { plan, approvalStatus: "approved", approvalIdentifier: "CERT-EXEC-001", planDigest: digestValue(plan) }, repositoryEvidence: { branch: "work", commit: "a2c70b8", workingTree: "clean", changedFiles: ["pbos/validation/governed.ts"] }, validationEvidence };
}

describe("governed PBOS validation", () => {
  it("returns deterministic PASS for complete evidence and a valid contract", () => {
    const first = validateExecutionOutcome(fixture());
    expect(validateExecutionOutcome(fixture())).toEqual(first);
    expect(first.status).toBe("PASS");
    expect(first.missingEvidence).toEqual([]);
    expect(first.validationId).toMatch(/^PBOS-VAL-[A-F0-9]{16}$/);
  });

  it("blocks missing evidence", () => {
    const input = fixture();
    input.validationEvidence = input.validationEvidence.slice(1);
    const result = validateExecutionOutcome(input);
    expect(result.status).toBe("BLOCKED");
    expect(result.missingEvidence).not.toEqual([]);
  });

  it("fails failed tests", () => {
    const input = fixture();
    input.validationEvidence.find((item) => item.requirement === "validation:test")!.status = "FAIL";
    const result = validateExecutionOutcome(input);
    expect(result.status).toBe("FAIL");
    expect(result.failedRequirements).toContain("validation:test");
  });

  it("blocks an invalid execution contract", () => {
    const input = fixture();
    input.executionContract.planDigest = "invalid";
    expect(validateExecutionOutcome(input).blockingConditions).toContain("Execution contract approval or digest is invalid.");
  });

  it("fails a constitutional violation", () => {
    const input = fixture();
    input.validationEvidence.find((item) => item.validationType === "constitutional")!.status = "FAIL";
    const result = validateExecutionOutcome(input);
    expect(result.status).toBe("FAIL");
    expect(result.failedRequirements.some((item) => item.startsWith("constitutional:"))).toBe(true);
  });

  it("fails an unresolved dependency", () => {
    const input = fixture();
    input.validationEvidence.find((item) => item.validationType === "dependency")!.status = "FAIL";
    const result = validateExecutionOutcome(input);
    expect(result.status).toBe("FAIL");
    expect(result.failedRequirements).toContain("dependency:PBOS-ENGINE-EXECUTION-001");
  });
});
