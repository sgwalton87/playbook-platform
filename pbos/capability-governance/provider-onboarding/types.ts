export const PRODUCTION_PROVIDER_TYPES = [
  "IDENTITY_PROVIDER",
  "CREDENTIAL_PROVIDER",
  "STORAGE_PROVIDER",
  "DATABASE_PROVIDER",
  "EVIDENCE_PROVIDER",
  "OBSERVABILITY_PROVIDER",
  "RECOVERY_PROVIDER",
  "SECURITY_PROVIDER",
] as const;

export type ProductionProviderType = (typeof PRODUCTION_PROVIDER_TYPES)[number];
export type ProviderLifecycleState =
  | "REGISTERED"
  | "EVIDENCE_REQUIRED"
  | "UNDER_REVIEW"
  | "VALIDATED"
  | "CERTIFIED"
  | "SUSPENDED"
  | "REVOKED";

export interface ProductionProviderRegistration {
  readonly provider_id: string;
  readonly provider_name: string;
  readonly provider_type: ProductionProviderType;
  readonly organization_identity: string;
  readonly ownership_information: string;
  readonly service_scope: readonly string[];
  readonly capabilities_supported: readonly string[];
  readonly security_contact: string;
  readonly operational_contact: string;
  readonly registration_status: ProviderLifecycleState;
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface ProviderLifecycleTransition {
  readonly transition_id: string;
  readonly provider_id: string;
  readonly from: ProviderLifecycleState;
  readonly to: ProviderLifecycleState;
  readonly authorized_reviewer: string;
  readonly reason: string;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export type ProviderEvidenceCategory =
  | "IDENTITY_ASSURANCE"
  | "OWNERSHIP_PROOF"
  | "CREDENTIAL_SECURITY"
  | "KEY_MANAGEMENT"
  | "DATA_PROTECTION"
  | "AVAILABILITY"
  | "CONSISTENCY_GUARANTEES"
  | "BACKUP_PROCEDURES"
  | "RECOVERY_PROCEDURES"
  | "MONITORING"
  | "INCIDENT_RESPONSE"
  | "PERFORMANCE_EVIDENCE"
  | "COMPLIANCE_EVIDENCE";

export interface ProductionProviderEvidencePackage {
  readonly evidence_id: string;
  readonly provider_id: string;
  readonly category: ProviderEvidenceCategory;
  readonly claim_type: string;
  readonly claim_description: string;
  readonly evidence_source: string;
  readonly source_digest: string;
  readonly verification_method: string;
  readonly submitted_by: string;
  readonly submitted_at: string;
  readonly expiration: string;
  readonly status:
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "VALIDATED"
    | "REJECTED"
    | "EXPIRED";
  readonly digest: string;
}

export type ProviderEvidenceValidationOutcome =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "FAILED"
  | "EXPIRED"
  | "REQUIRES_REVIEW";

export interface ProviderEvidenceValidation {
  readonly validation_id: string;
  readonly validator_identity: string;
  readonly evidence_reference: string;
  readonly evidence_digest: string;
  readonly validation_method: string;
  readonly validation_result: ProviderEvidenceValidationOutcome;
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProviderCertificationReadinessAssessment {
  readonly assessment_id: string;
  readonly provider: string;
  readonly domain: ProductionProviderType;
  readonly requirement: string;
  readonly evidence: readonly string[];
  readonly validation: readonly string[];
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly readiness_score: number;
  readonly decision:
    | "READY_FOR_CERTIFICATION"
    | "CONDITIONAL"
    | "BLOCKED";
  readonly timestamp: string;
  readonly digest: string;
}
