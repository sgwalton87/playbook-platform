import type { ProductionProviderType } from "../provider-onboarding";
import type { CertificationEvidenceCategory } from "../provider-certification-execution";

export type ProviderCandidateStatus =
  | "IDENTIFIED"
  | "INVITED"
  | "REGISTERED"
  | "EVIDENCE_REQUESTED"
  | "EVIDENCE_SUBMITTED"
  | "UNDER_REVIEW"
  | "CERTIFICATION_READY"
  | "CERTIFIED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ProviderCertificationCandidate {
  readonly candidate_id: string;
  readonly provider_name: string;
  readonly provider_type: ProductionProviderType;
  readonly organization_identity: string;
  readonly legal_identity_reference: string;
  readonly ownership_information: string;
  readonly business_contact: string;
  readonly technical_contact: string;
  readonly security_contact: string;
  readonly operational_contact: string;
  readonly requested_capabilities: readonly string[];
  readonly service_scope: readonly string[];
  readonly jurisdiction: string;
  readonly status: ProviderCandidateStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface ProviderCandidateTransition {
  readonly transition_id: string;
  readonly candidate_id: string;
  readonly from: ProviderCandidateStatus;
  readonly to: ProviderCandidateStatus;
  readonly actor: string;
  readonly authority: string;
  readonly timestamp: string;
  readonly reason: string;
  readonly evidence_reference: string;
  readonly digest: string;
}

export interface ProviderCandidateEvidenceRequirement {
  readonly requirement_id: string;
  readonly candidate_id: string;
  readonly category: CertificationEvidenceCategory;
  readonly description: string;
  readonly required_artifact: string;
  readonly artifact_reference: string | null;
  readonly artifact_digest: string | null;
  readonly expiration: string;
  readonly validator: string;
  readonly submitter: string;
  readonly status: "REQUESTED" | "SUBMITTED" | "VERIFIED" | "REJECTED" | "EXPIRED";
  readonly digest: string;
}

export interface ProviderCertificationEvidencePackage {
  readonly package_id: string;
  readonly candidate_id: string;
  readonly requirements: readonly ProviderCandidateEvidenceRequirement[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderCertificationReadinessAssessment {
  readonly assessment_id: string;
  readonly candidate_id: string;
  readonly identity_ready: boolean;
  readonly security_ready: boolean;
  readonly operations_ready: boolean;
  readonly recovery_ready: boolean;
  readonly evidence_complete: boolean;
  readonly risk_profile: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly governance_aligned: boolean;
  readonly decision: "READY" | "CONDITIONAL" | "BLOCKED";
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderCertificationReviewAssignment {
  readonly assignment_id: string;
  readonly candidate_id: string;
  readonly reviewer_identity: string;
  readonly reviewer_authority: string;
  readonly conflict_check: "PASS" | "FAIL";
  readonly assigned_scope: readonly string[];
  readonly review_deadline: string;
  readonly status: "ASSIGNED" | "IN_REVIEW" | "COMPLETED" | "REJECTED";
  readonly digest: string;
}

export interface ProviderCertificationSubmissionPackage {
  readonly submission_id: string;
  readonly candidate_id: string;
  readonly candidate_digest: string;
  readonly evidence_package_digest: string;
  readonly validation_results: readonly string[];
  readonly risk_assessment: readonly string[];
  readonly reviewer_findings: readonly string[];
  readonly review_assignment_reference: string;
  readonly readiness_decision: "READY";
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderProofReadinessAssessment {
  readonly assessment_id: string;
  readonly candidate_id: string;
  readonly provider_certified: boolean;
  readonly evidence_validated: boolean;
  readonly certification_authority_approved: boolean;
  readonly proof_requirements_satisfied: boolean;
  readonly decision: "READY" | "CONDITIONAL" | "BLOCKED";
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}
