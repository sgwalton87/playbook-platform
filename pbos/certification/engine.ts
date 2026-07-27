import { digestValue, type PBOSRuntimeContext } from "../context";
import type {
  CertificationInput,
  CertificationResult,
  CertificationStatus,
} from "./contracts";

const VALIDATION_ID = /^PBOS-VAL-[A-F0-9]{16}$/;
const COMMIT = /^[a-f0-9]{7,64}$/;

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

export function evaluateCertification(input: CertificationInput): CertificationResult {
  const context = input.runtimeContext;
  const contextValid = Boolean(
    context &&
    context.contextDigest === expectedContextDigest(context) &&
    context.documentInventory.length
  );
  const constitutionalCompliance = Boolean(
    contextValid &&
    !context?.exclusionRecords.length &&
    !context?.constraints.some((constraint) => constraint.kind === "execution-block") &&
    !input.validationResult.failedRequirements.some((requirement) => requirement.startsWith("constitutional:"))
  );
  const executionContractValid = Boolean(
    input.executionContract.approvalStatus === "approved" &&
    input.executionContract.approvalIdentifier &&
    input.executionContract.planDigest === digestValue(input.executionContract.plan) &&
    input.executionContract.plan.executionId === input.validationResult.executionId
  );
  const pendingExceptions = input.governance.exceptions.filter((exception) => exception.approvalStatus !== "approved" || !exception.approvalIdentifier);
  const governanceCompliance = Boolean(
    input.governance.approvalStatus === "approved" &&
    input.governance.approvalIdentifier &&
    !input.governance.blockers.length &&
    !pendingExceptions.length
  );
  const validationConsistent = Boolean(
    VALIDATION_ID.test(input.validationResult.validationId) &&
    (
      (input.validationResult.status === "PASS" &&
        !input.validationResult.failedRequirements.length &&
        !input.validationResult.missingEvidence.length &&
        !input.validationResult.blockingConditions.length) ||
      (input.validationResult.status === "FAIL" && input.validationResult.failedRequirements.length > 0) ||
      (input.validationResult.status === "BLOCKED" &&
        (input.validationResult.missingEvidence.length > 0 || input.validationResult.blockingConditions.length > 0))
    )
  );
  const repositoryEvidenceValid = Boolean(
    input.repositoryEvidence.branch.trim() &&
    COMMIT.test(input.repositoryEvidence.commit) &&
    input.repositoryEvidence.workingTree === "clean" &&
    input.repositoryEvidence.changedFiles.length
  );
  const certificationEvidenceBundle = [
    ...input.validationResult.evidenceReferences,
    ...input.governance.evidenceReferences,
    ...input.governance.exceptions.flatMap((exception) => exception.evidenceReferences),
    `context:${context?.contextDigest ?? "missing"}`,
    `execution:${input.executionContract.plan.executionId}`,
    `execution-approval:${input.executionContract.approvalIdentifier ?? "missing"}`,
    `governance-approval:${input.governance.approvalIdentifier ?? "missing"}`,
    `repository:${input.repositoryEvidence.commit}`,
    `validation:${input.validationResult.validationId}`,
  ].filter((item, index, values) => Boolean(item) && values.indexOf(item) === index).sort();
  const evidenceCompleteness = Boolean(
    repositoryEvidenceValid &&
    input.validationResult.evidenceReferences.length &&
    input.governance.evidenceReferences.length &&
    !input.validationResult.missingEvidence.length &&
    certificationEvidenceBundle.length
  );
  const requiredApprovals = [
    ...(!input.executionContract.approvalIdentifier ? ["execution-contract-approval"] : []),
    ...(!input.governance.approvalIdentifier ? ["certification-governance-approval"] : []),
    ...pendingExceptions.map((exception) => `exception:${exception.identifier}`),
  ].sort();

  let certificationStatus: CertificationStatus = "CERTIFIED";
  if (
    !contextValid ||
    !executionContractValid ||
    !validationConsistent ||
    input.validationResult.status === "FAIL"
  ) {
    certificationStatus = "REJECTED";
  } else if (
    input.validationResult.status === "BLOCKED" ||
    !constitutionalCompliance ||
    !governanceCompliance ||
    !evidenceCompleteness
  ) {
    certificationStatus = "BLOCKED";
  }

  const validationSummary = {
    validationId: input.validationResult.validationId,
    status: input.validationResult.status,
    satisfiedCount: input.validationResult.satisfiedRequirements.length,
    failedCount: input.validationResult.failedRequirements.length,
    missingCount: input.validationResult.missingEvidence.length,
    blockerCount: input.validationResult.blockingConditions.length,
  };
  const resultBody = {
    certificationStatus,
    validationSummary,
    constitutionalCompliance,
    governanceCompliance,
    evidenceCompleteness,
    exceptions: input.governance.exceptions.map((exception) => exception.identifier).sort(),
    requiredApprovals,
    certificationEvidenceBundle,
  };

  return {
    certificationId: `PBOS-CERT-${digestValue({
      contextDigest: context?.contextDigest,
      executionContract: input.executionContract,
      governance: input.governance,
      repositoryEvidence: input.repositoryEvidence,
      result: resultBody,
    }).slice(0, 16).toUpperCase()}`,
    ...resultBody,
  };
}
