export type ProductionProviderCertificationStatus =
  | "CERTIFIED"
  | "CONDITIONAL"
  | "BLOCKED";

export interface ProductionIdentityCertificationRecord {
  readonly record_id: string;
  readonly provider: string;
  readonly capability: string;
  readonly validation_method: string;
  readonly evidence: readonly string[];
  readonly identity_resolution: boolean;
  readonly credential_verification: boolean;
  readonly issuer_authentication: boolean;
  readonly organization_verification: boolean;
  readonly tenant_ownership: boolean;
  readonly authority_scope_validation: boolean;
  readonly credential_status: "CURRENT" | "EXPIRED" | "MISSING" | "INVALID";
  readonly revocation_handling: boolean;
  readonly timestamp: string;
  readonly valid_until: string;
  readonly status: ProductionProviderCertificationStatus;
  readonly digest: string;
}

export interface ProductionStorageCertificationRecord {
  readonly record_id: string;
  readonly provider: string;
  readonly storage_model: string;
  readonly transaction_support: boolean;
  readonly revision_control: boolean;
  readonly concurrency_handling: boolean;
  readonly consistency_model: "LINEARIZABLE" | "SERIALIZABLE" | "OTHER";
  readonly failure_handling: boolean;
  readonly recovery_model: string;
  readonly backup_strategy: string;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly status: ProductionProviderCertificationStatus;
  readonly digest: string;
}

export interface ProductionEvidenceCertificationRecord {
  readonly record_id: string;
  readonly provider: string;
  readonly evidence_type: string;
  readonly storage_location: string;
  readonly integrity_method: string;
  readonly retention_policy: string;
  readonly immutable_storage: boolean;
  readonly audit_ordering: boolean;
  readonly retrieval_verified: boolean;
  readonly tamper_detection: boolean;
  readonly expected_digest: string;
  readonly observed_digest: string;
  readonly evidence: readonly string[];
  readonly verification_result: "PASS" | "FAIL";
  readonly timestamp: string;
  readonly status: ProductionProviderCertificationStatus;
  readonly digest: string;
}

export interface ProductionRecoveryCertificationRecord {
  readonly record_id: string;
  readonly provider: string;
  readonly backup_method: string;
  readonly restore_method: string;
  readonly validation_result: "PASS" | "FAIL";
  readonly recovery_owner: string;
  readonly state_verification: boolean;
  readonly evidence_preservation: boolean;
  readonly rollback_prevention: boolean;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly status: ProductionProviderCertificationStatus;
  readonly digest: string;
}

export interface ProductionOperationsCertificationRecord {
  readonly record_id: string;
  readonly provider: string;
  readonly metric_source: string;
  readonly metric_names: readonly string[];
  readonly alert_definitions: readonly string[];
  readonly owner: string;
  readonly response_process: string;
  readonly security_event_logging: boolean;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly status: ProductionProviderCertificationStatus;
  readonly digest: string;
}

export interface ProductionSecurityCertificationRecord {
  readonly record_id: string;
  readonly provider: string;
  readonly key_management: boolean;
  readonly credential_rotation: boolean;
  readonly access_review: boolean;
  readonly revocation_propagation: boolean;
  readonly incident_response: boolean;
  readonly security_logging: boolean;
  readonly owner: string;
  readonly evidence: readonly string[];
  readonly timestamp: string;
  readonly status: ProductionProviderCertificationStatus;
  readonly digest: string;
}

export interface ProductionProviderCertificationPackage {
  readonly package_id: string;
  readonly identity: ProductionIdentityCertificationRecord;
  readonly storage: ProductionStorageCertificationRecord;
  readonly evidence: ProductionEvidenceCertificationRecord;
  readonly recovery: ProductionRecoveryCertificationRecord;
  readonly operations: ProductionOperationsCertificationRecord;
  readonly security: ProductionSecurityCertificationRecord;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ProductionProviderCertificationDecision {
  readonly certification_id: string;
  readonly package_id: string;
  readonly status: "CERTIFIED" | "CONDITIONAL" | "BLOCKED" | "REVOKED";
  readonly provider_record_digests: readonly string[];
  readonly findings: readonly string[];
  readonly authority: "PBOS-PRODUCTION-PROVIDER-CERTIFICATION";
  readonly timestamp: string;
  readonly digest: string;
}
