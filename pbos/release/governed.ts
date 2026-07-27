import { digestValue, type PBOSRuntimeContext } from "../context";
import type {
  GovernedReleaseDecision,
  GovernedReleaseInput,
  GovernedReleaseStatus,
} from "./governed-contracts";

const CERTIFICATION_ID = /^PBOS-CERT-[A-F0-9]{16}$/;
const COMMIT = /^[a-f0-9]{7,64}$/;
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

function validTransition(currentVersion: string, nextVersion: string): boolean {
  const current = currentVersion.match(SEMVER);
  const next = nextVersion.match(SEMVER);
  if (!current || !next) return false;
  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(next[index]) - Number(current[index]);
    if (difference !== 0) return difference > 0;
  }
  return false;
}

export function evaluateRelease(input: GovernedReleaseInput): GovernedReleaseDecision {
  const context = input.runtimeContext;
  const contextValid = Boolean(
    context &&
    context.contextDigest === expectedContextDigest(context) &&
    context.documentInventory.length &&
    !context.exclusionRecords.length &&
    !context.constraints.some((constraint) => constraint.kind === "execution-block")
  );
  const executionValid = Boolean(
    input.executionContract.approvalStatus === "approved" &&
    input.executionContract.approvalIdentifier &&
    input.executionContract.planDigest === digestValue(input.executionContract.plan) &&
    input.executionContract.plan.executionId === input.validationResult.executionId
  );
  const validationComplete = Boolean(
    input.validationResult.status === "PASS" &&
    !input.validationResult.failedRequirements.length &&
    !input.validationResult.missingEvidence.length &&
    !input.validationResult.blockingConditions.length
  );
  const certificationValid = Boolean(
    input.certificationResult.certificationStatus === "CERTIFIED" &&
    CERTIFICATION_ID.test(input.certificationResult.certificationId) &&
    input.certificationResult.validationSummary.validationId === input.validationResult.validationId &&
    input.certificationResult.constitutionalCompliance &&
    input.certificationResult.governanceCompliance &&
    input.certificationResult.evidenceCompleteness &&
    !input.certificationResult.requiredApprovals.length
  );
  const repositoryValid = Boolean(
    input.repositoryEvidence.branch.trim() &&
    COMMIT.test(input.repositoryEvidence.commit) &&
    input.repositoryEvidence.workingTree === "clean" &&
    input.repositoryEvidence.changedFiles.length
  );
  const governanceApproved = Boolean(
    input.governance.approvalStatus === "approved" &&
    input.governance.approvalIdentifier &&
    !input.governance.blockers.length
  );
  const metadataComplete = Boolean(
    validTransition(input.currentVersion, input.nextVersion) &&
    input.releaseNotes.title.trim() &&
    input.releaseNotes.summary.trim() &&
    input.releaseNotes.changes.length &&
    input.releaseNotes.documentationReferences.length &&
    input.executionContract.plan.rollbackExpectations.length
  );
  const evidenceComplete = Boolean(
    input.validationResult.evidenceReferences.length &&
    input.certificationResult.certificationEvidenceBundle.length &&
    input.governance.evidenceReferences.length
  );

  const outstandingConditions = [
    ...(!contextValid ? ["Runtime Context is invalid or constitutionally blocked."] : []),
    ...(!executionValid ? ["Execution Contract is invalid or unapproved."] : []),
    ...(!validationComplete ? ["Validation evidence is not complete and passing."] : []),
    ...(!certificationValid ? ["Certification is absent, blocked, rejected, or inconsistent."] : []),
    ...(!repositoryValid ? ["Repository evidence is incomplete or invalid."] : []),
    ...(!governanceApproved ? ["Release governance approval is missing or blocked."] : []),
    ...(!metadataComplete ? ["Release metadata, version transition, or rollback requirements are incomplete."] : []),
    ...(!evidenceComplete ? ["Release evidence bundle is incomplete."] : []),
  ].sort();
  const approvalRequirements = [
    ...(!input.executionContract.approvalIdentifier ? ["execution-contract-approval"] : []),
    ...(!input.governance.approvalIdentifier ? ["release-governance-approval"] : []),
    ...input.certificationResult.requiredApprovals,
  ].filter((item, index, values) => values.indexOf(item) === index).sort();
  const evidenceBundle = [
    ...input.validationResult.evidenceReferences,
    ...input.certificationResult.certificationEvidenceBundle,
    ...input.governance.evidenceReferences,
    ...input.releaseNotes.documentationReferences,
    `certification:${input.certificationResult.certificationId}`,
    `context:${context?.contextDigest ?? "missing"}`,
    `execution:${input.executionContract.plan.executionId}`,
    `release-approval:${input.governance.approvalIdentifier ?? "missing"}`,
    `repository:${input.repositoryEvidence.commit}`,
  ].filter((item, index, values) => values.indexOf(item) === index).sort();

  let releaseStatus: GovernedReleaseStatus = "APPROVED";
  if (!contextValid || !executionValid || !validationComplete || !certificationValid || !repositoryValid) {
    releaseStatus = "REJECTED";
  } else if (!governanceApproved || !metadataComplete || !evidenceComplete) {
    releaseStatus = "BLOCKED";
  }
  const resultBody = {
    releaseStatus,
    versionTransition: { from: input.currentVersion, to: input.nextVersion },
    certificationReference: input.certificationResult.certificationId,
    evidenceBundle,
    releaseNotesMetadata: {
      ...input.releaseNotes,
      changes: [...input.releaseNotes.changes],
      documentationReferences: [...input.releaseNotes.documentationReferences].sort(),
    },
    rollbackRequirements: [...input.executionContract.plan.rollbackExpectations],
    outstandingConditions,
    approvalRequirements,
  };

  return {
    releaseId: `PBOS-REL-${digestValue({
      contextDigest: context?.contextDigest,
      executionContract: input.executionContract,
      governance: input.governance,
      repositoryEvidence: input.repositoryEvidence,
      result: resultBody,
    }).slice(0, 16).toUpperCase()}`,
    ...resultBody,
  };
}
