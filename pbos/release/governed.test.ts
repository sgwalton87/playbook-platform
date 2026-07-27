import { describe, expect, it } from "vitest";
import { digestValue, sha256 } from "../context";
import type { PBOSRuntimeContext } from "../context";
import type { CertificationResult } from "../certification";
import type { ExecutionPlan } from "../execution";
import type { GovernedValidationResult } from "../validation";
import { evaluateRelease } from "./governed";
import type { GovernedReleaseInput } from "./governed-contracts";

function fixture(): GovernedReleaseInput {
  const contextWithoutDigest = {
    contextVersion: "1.0.0" as const,
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
    sourceDigest: sha256("sources"),
    registryDigest: sha256("registry"),
    governanceDigest: sha256("governance"),
    documentInventory: [{ identifier: "PPS-807", title: "Release Engine", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-807_RELEASE_ENGINE.md", owner: "PBOS", digest: sha256("release") }],
    validatedRules: [],
    constraints: [],
    dependencyGraph: [],
    exclusionRecords: [],
  };
  const runtimeContext: PBOSRuntimeContext = { ...contextWithoutDigest, contextDigest: digestValue(contextWithoutDigest) };
  const plan: ExecutionPlan = { executionId: "PBOS-EXEC-1234567890ABCDEF", approvedObjective: "Create a governed release decision.", sourceGate: "PBOS-ENGINE-RELEASE-001", satisfiedDependencies: ["PBOS-ENGINE-CERTIFICATION-001"], requiredActions: ["Evaluate release eligibility."], affectedSystems: ["PBOS Release Engine"], constraints: [], requiredValidations: ["build", "test"], rollbackExpectations: ["Restore the prior certified release."], evidenceRequirements: ["Certification evidence"], completionCriteria: ["Release decision is deterministic."] };
  const validationResult: GovernedValidationResult = { validationId: "PBOS-VAL-1234567890ABCDEF", executionId: plan.executionId, status: "PASS", satisfiedRequirements: ["validation:build", "validation:test"], failedRequirements: [], missingEvidence: [], blockingConditions: [], evidenceReferences: ["validation-evidence"], remediationRecommendations: [] };
  const certificationResult: CertificationResult = { certificationId: "PBOS-CERT-1234567890ABCDEF", certificationStatus: "CERTIFIED", validationSummary: { validationId: validationResult.validationId, status: "PASS", satisfiedCount: 2, failedCount: 0, missingCount: 0, blockerCount: 0 }, constitutionalCompliance: true, governanceCompliance: true, evidenceCompleteness: true, exceptions: [], requiredApprovals: [], certificationEvidenceBundle: ["certification-evidence"] };
  return {
    runtimeContext,
    executionContract: { plan, approvalStatus: "approved", approvalIdentifier: "EXEC-APPROVAL-001", planDigest: digestValue(plan) },
    validationResult,
    certificationResult,
    repositoryEvidence: { branch: "work", commit: "4a44d0d", workingTree: "clean", changedFiles: ["pbos/release/governed.ts"] },
    governance: { approvalStatus: "approved", approvalIdentifier: "RELEASE-APPROVAL-001", blockers: [], evidenceReferences: ["release-approval-evidence"] },
    currentVersion: "1.0.0",
    nextVersion: "1.1.0",
    releaseNotes: { title: "PBOS Release Engine V1", summary: "Add governed release decisions.", changes: ["Add deterministic release evaluation."], documentationReferences: ["docs/GOVERNANCE/CONSTITUTIONAL/PBOS_RELEASE_ENGINE_V1_IMPLEMENTATION.md"] },
  };
}

describe("governed PBOS release", () => {
  it("creates an approved deterministic decision for a certified state", () => {
    const first = evaluateRelease(fixture());
    expect(evaluateRelease(fixture())).toEqual(first);
    expect(first.releaseStatus).toBe("APPROVED");
    expect(first.releaseId).toMatch(/^PBOS-REL-[A-F0-9]{16}$/);
  });

  it("rejects uncertified work", () => {
    const input = fixture();
    input.certificationResult.certificationStatus = "REJECTED";
    expect(evaluateRelease(input).releaseStatus).toBe("REJECTED");
  });

  it("rejects blocked certification", () => {
    const input = fixture();
    input.certificationResult.certificationStatus = "BLOCKED";
    expect(evaluateRelease(input).releaseStatus).toBe("REJECTED");
  });

  it("blocks missing release evidence", () => {
    const input = fixture();
    input.governance.evidenceReferences = [];
    expect(evaluateRelease(input).releaseStatus).toBe("BLOCKED");
  });

  it("rejects invalid Runtime Context", () => {
    const input = fixture();
    input.runtimeContext!.contextDigest = "invalid";
    expect(evaluateRelease(input).releaseStatus).toBe("REJECTED");
  });
});
