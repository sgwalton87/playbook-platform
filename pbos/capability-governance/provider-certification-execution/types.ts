import type { ProductionProviderIntakeRecord } from "../provider-intake";

export const CERTIFICATION_EVIDENCE_CATEGORIES = [
  "IDENTITY",
  "OWNERSHIP",
  "SECURITY",
  "CREDENTIAL_MANAGEMENT",
  "DATA_PROTECTION",
  "STORAGE",
  "RECOVERY",
  "OBSERVABILITY",
  "PERFORMANCE",
  "OPERATIONS",
  "COMPLIANCE",
] as const;

export type CertificationEvidenceCategory =
  (typeof CERTIFICATION_EVIDENCE_CATEGORIES)[number];
export type ProviderCertificationOutcome =
  | "CERTIFIED"
  | "CONDITIONAL"
  | "BLOCKED"
  | "REVOKED";

export interface ProviderCertificationExecution {
  readonly certification_id: string;
  readonly provider_id: string;
  readonly provider_identity: string;
  readonly intake_reference: string;
  readonly requested_capabilities: readonly string[];
  readonly certification_scope: readonly string[];
  readonly review_status:
    | "REQUESTED"
    | "EVIDENCE_REVIEW"
    | "REVIEWED"
    | "DECIDED";
  readonly assigned_authority: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface CertificationEvidenceRequirement {
  readonly requirement: CertificationEvidenceCategory;
  readonly provider_claim: string;
  readonly submitted_evidence: readonly string[];
  readonly evidence_digests: readonly string[];
  readonly validator: string;
  readonly provider_submitter: string;
  readonly status: "VERIFIED" | "INCOMPLETE" | "REJECTED" | "EXPIRED";
  readonly expiration: string;
  readonly digest: string;
}

export interface CertificationEvidenceChecklist {
  readonly checklist_id: string;
  readonly certification_id: string;
  readonly provider_id: string;
  readonly requirements: readonly CertificationEvidenceRequirement[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderCertificationReview {
  readonly review_id: string;
  readonly certification_id: string;
  readonly reviewer_identity: string;
  readonly evidence_reviewed: readonly string[];
  readonly security_findings: readonly string[];
  readonly operational_findings: readonly string[];
  readonly risk_findings: readonly string[];
  readonly decision: "RECOMMEND_CERTIFICATION" | "RECOMMEND_BLOCK";
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderCertificationDecision {
  readonly decision_id: string;
  readonly certification_id: string;
  readonly provider_id: string;
  readonly decision: ProviderCertificationOutcome;
  readonly decision_authority: string;
  readonly evidence_basis: readonly string[];
  readonly review_reference: string;
  readonly risk_summary: readonly string[];
  readonly expiration: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface KernelProductionProofRequest {
  readonly request_id: string;
  readonly provider_identity: string;
  readonly certification_identity: string;
  readonly validated_evidence: readonly string[];
  readonly review_identity: string;
  readonly certification_decision_digest: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ScholarRecordActivationReadiness {
  readonly assessment_id: string;
  readonly provider_certification_status: ProviderCertificationOutcome;
  readonly kernel_proof_available: boolean;
  readonly storage_ready: boolean;
  readonly evidence_ready: boolean;
  readonly recovery_ready: boolean;
  readonly operations_ready: boolean;
  readonly decision: "READY" | "CONDITIONAL" | "BLOCKED";
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderCertificationAttempt {
  readonly intake: ProductionProviderIntakeRecord;
  readonly execution: ProviderCertificationExecution;
  readonly checklist: CertificationEvidenceChecklist;
}
