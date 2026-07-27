import type { PBOSRuntimeContext } from "../context";
import type {
  ApprovedExecutionContract,
  GovernedValidationResult,
  ValidationRepositoryEvidence,
} from "../validation";

export interface CertificationException {
  identifier: string;
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  evidenceReferences: string[];
}

export interface CertificationGovernanceState {
  approvalStatus: "approved" | "pending" | "rejected" | "revoked";
  approvalIdentifier: string | null;
  blockers: string[];
  evidenceReferences: string[];
  exceptions: CertificationException[];
}

export interface CertificationInput {
  runtimeContext: PBOSRuntimeContext | null;
  executionContract: ApprovedExecutionContract;
  validationResult: GovernedValidationResult;
  governance: CertificationGovernanceState;
  repositoryEvidence: ValidationRepositoryEvidence;
}

export type CertificationStatus = "CERTIFIED" | "REJECTED" | "BLOCKED";

export interface CertificationValidationSummary {
  validationId: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  satisfiedCount: number;
  failedCount: number;
  missingCount: number;
  blockerCount: number;
}

export interface CertificationResult {
  certificationId: string;
  certificationStatus: CertificationStatus;
  validationSummary: CertificationValidationSummary;
  constitutionalCompliance: boolean;
  governanceCompliance: boolean;
  evidenceCompleteness: boolean;
  exceptions: string[];
  requiredApprovals: string[];
  certificationEvidenceBundle: string[];
}
