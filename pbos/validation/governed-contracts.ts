import type { PBOSRuntimeContext } from "../context";
import type { ExecutionPlan } from "../execution";

export type ValidationType = "constitutional" | "dependency" | "implementation" | "evidence" | "release";
export type EvidenceStatus = "PASS" | "FAIL";

export interface ApprovedExecutionContract {
  plan: ExecutionPlan;
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  planDigest: string;
}

export interface ValidationRepositoryEvidence {
  branch: string;
  commit: string;
  workingTree: "clean" | "dirty";
  changedFiles: string[];
}

export interface ValidationEvidenceItem {
  identifier: string;
  validationType: ValidationType;
  requirement: string;
  status: EvidenceStatus;
  evidenceReferences: string[];
  summary: string;
}

export interface GovernedValidationInput {
  runtimeContext: PBOSRuntimeContext | null;
  executionContract: ApprovedExecutionContract;
  repositoryEvidence: ValidationRepositoryEvidence;
  validationEvidence: ValidationEvidenceItem[];
}

export type GovernedValidationStatus = "PASS" | "FAIL" | "BLOCKED";

export interface GovernedValidationResult {
  validationId: string;
  executionId: string;
  status: GovernedValidationStatus;
  satisfiedRequirements: string[];
  failedRequirements: string[];
  missingEvidence: string[];
  blockingConditions: string[];
  evidenceReferences: string[];
  remediationRecommendations: string[];
}
