import { describe, expect, it } from "vitest";
import { compileContext, digestValue, sha256 } from "../context";
import { createGovernedExecutionPlan } from "../execution";
import type { PlanningDecision } from "../planner";
import { validateExecutionOutcome } from "../validation";
import type { ValidationEvidenceItem } from "../validation";
import { evaluateCertification } from "./engine";
import type { CertificationInput } from "./contracts";

function fixture(): CertificationInput {
  const content = "canonical certification authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-806", title: "Certification Engine", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-806_CERTIFICATION_ENGINE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified", constraints: [{ id: "CERT-APPROVAL", kind: "approval", description: "Require certification approval." }] }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-806", location: "docs/PPS/08_PBOS_ENGINE/PPS-806_CERTIFICATION_ENGINE.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  const planningDecision: PlanningDecision = { selectedGate: "PBOS-ENGINE-CERTIFICATION-001", reasoning: ["Eligible."], satisfiedDependencies: ["PBOS-ENGINE-VALIDATION-001"], blockingDependencies: [], requiredValidations: ["test"], confidenceClassification: "HIGH", evidenceReferences: ["authority:PPS-806"] };
  const plan = createGovernedExecutionPlan({
    runtimeContext,
    planningDecision,
    gate: { identifier: "PBOS-ENGINE-CERTIFICATION-001", objective: "Evaluate certification readiness.", status: "ready", dependencies: ["PBOS-ENGINE-VALIDATION-001"], requiredActions: ["Evaluate certification evidence."], affectedSystems: ["PBOS Certification Engine"], validationRequirements: ["test"], rollbackExpectations: ["Retain the prior certification state."], evidenceRequirements: ["Validation result"], completionCriteria: ["Certification decision is deterministic."] },
    governance: { approvalStatus: "approved", approvalIdentifier: "EXEC-APPROVAL-001", evidenceReferences: ["execution-approval-record"], blockers: [], exclusions: [] },
    repository: { branch: "work", commit: "b8f4eef", workingTree: "clean", validationResults: [] },
  });
  const requirements = [
    ...plan.requiredValidations.map((item) => `validation:${item}`),
    ...plan.satisfiedDependencies.map((item) => `dependency:${item}`),
    ...plan.requiredActions.map((item) => `implementation:${item}`),
    ...plan.completionCriteria.map((item) => `completion:${item}`),
    ...plan.constraints.map((item) => `constitutional:${item}`),
    "release:readiness",
  ];
  const validationEvidence: ValidationEvidenceItem[] = requirements.map((requirement, index) => ({ identifier: `EVIDENCE-${index}`, validationType: requirement.startsWith("constitutional:") ? "constitutional" : requirement.startsWith("dependency:") ? "dependency" : requirement.startsWith("implementation:") || requirement.startsWith("completion:") ? "implementation" : requirement.startsWith("release:") ? "release" : "evidence", requirement, status: "PASS", evidenceReferences: [`evidence:${index}`], summary: "Passed." }));
  const executionContract = { plan, approvalStatus: "approved" as const, approvalIdentifier: "EXEC-CONTRACT-APPROVAL", planDigest: digestValue(plan) };
  const repositoryEvidence = { branch: "work", commit: "b8f4eef", workingTree: "clean" as const, changedFiles: ["pbos/certification/engine.ts"] };
  const validationResult = validateExecutionOutcome({ runtimeContext, executionContract, repositoryEvidence, validationEvidence });
  return { runtimeContext, executionContract, validationResult, governance: { approvalStatus: "approved", approvalIdentifier: "CERT-APPROVAL-001", blockers: [], evidenceReferences: ["certification-approval-record"], exceptions: [] }, repositoryEvidence };
}

describe("governed PBOS certification", () => {
  it("certifies a valid validated execution deterministically", () => {
    const first = evaluateCertification(fixture());
    expect(evaluateCertification(fixture())).toEqual(first);
    expect(first.certificationStatus).toBe("CERTIFIED");
    expect(first.certificationId).toMatch(/^PBOS-CERT-[A-F0-9]{16}$/);
  });

  it("rejects failed validation", () => {
    const input = fixture();
    input.validationResult.status = "FAIL";
    input.validationResult.failedRequirements = ["validation:test"];
    expect(evaluateCertification(input).certificationStatus).toBe("REJECTED");
  });

  it("blocks missing evidence", () => {
    const input = fixture();
    input.validationResult.status = "BLOCKED";
    input.validationResult.evidenceReferences = [];
    input.validationResult.missingEvidence = ["validation:test"];
    expect(evaluateCertification(input).certificationStatus).toBe("BLOCKED");
  });

  it("blocks unresolved governance", () => {
    const input = fixture();
    input.governance.blockers = ["Human review pending"];
    expect(evaluateCertification(input).certificationStatus).toBe("BLOCKED");
  });

  it("rejects invalid Runtime Context", () => {
    const input = fixture();
    input.runtimeContext!.contextDigest = "invalid";
    expect(evaluateCertification(input).certificationStatus).toBe("REJECTED");
  });
});
