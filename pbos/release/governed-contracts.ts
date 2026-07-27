import type { CertificationResult } from "../certification";
import type { PBOSRuntimeContext } from "../context";
import type { ApprovedExecutionContract, GovernedValidationResult, ValidationRepositoryEvidence } from "../validation";

export interface ReleaseGovernanceState {
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  blockers: string[];
  evidenceReferences: string[];
}

export interface ReleaseNotesMetadata {
  title: string;
  summary: string;
  changes: string[];
  documentationReferences: string[];
}

export interface GovernedReleaseInput {
  runtimeContext: PBOSRuntimeContext | null;
  executionContract: ApprovedExecutionContract;
  validationResult: GovernedValidationResult;
  certificationResult: CertificationResult;
  repositoryEvidence: ValidationRepositoryEvidence;
  governance: ReleaseGovernanceState;
  currentVersion: string;
  nextVersion: string;
  releaseNotes: ReleaseNotesMetadata;
}

export type GovernedReleaseStatus = "APPROVED" | "REJECTED" | "BLOCKED";

export interface VersionTransition {
  from: string;
  to: string;
}

export interface GovernedReleaseDecision {
  releaseId: string;
  releaseStatus: GovernedReleaseStatus;
  versionTransition: VersionTransition;
  certificationReference: string;
  evidenceBundle: string[];
  releaseNotesMetadata: ReleaseNotesMetadata;
  rollbackRequirements: string[];
  outstandingConditions: string[];
  approvalRequirements: string[];
}
