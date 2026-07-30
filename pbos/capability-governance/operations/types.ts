export interface OperationalControlEvidence {
  readonly control_id: string;
  readonly verified: boolean;
  readonly owner_identity: string;
  readonly evidence_references: readonly string[];
  readonly verified_at: string;
}

export interface CapabilityProductionReadinessContract {
  readonly contract_id: string;
  readonly environment: string;
  readonly observed_at: string;
  readonly storage: {
    readonly transactional: OperationalControlEvidence;
    readonly replication: OperationalControlEvidence;
    readonly concurrency: OperationalControlEvidence;
    readonly partition_handling: OperationalControlEvidence;
    readonly conflict_resolution: OperationalControlEvidence;
  };
  readonly recovery: {
    readonly backup: OperationalControlEvidence;
    readonly restore_test: OperationalControlEvidence;
    readonly disaster_recovery: OperationalControlEvidence;
    readonly rpo_minutes: number;
    readonly rto_minutes: number;
  };
  readonly operations: {
    readonly monitoring: OperationalControlEvidence;
    readonly alerting: OperationalControlEvidence;
    readonly failure_handling: OperationalControlEvidence;
    readonly audit_retention: OperationalControlEvidence;
    readonly performance_measurement: OperationalControlEvidence;
  };
  readonly security: {
    readonly credential_rotation: OperationalControlEvidence;
    readonly revocation_propagation: OperationalControlEvidence;
    readonly incident_response: OperationalControlEvidence;
    readonly access_review: OperationalControlEvidence;
    readonly audit_review: OperationalControlEvidence;
  };
  readonly service_objectives: {
    readonly availability_percent: number;
    readonly admission_latency_ms: number;
    readonly recovery_event_budget: number;
    readonly evidence_reference: string;
  };
  readonly digest: string;
}

export interface CapabilityProductionReadinessDecision {
  readonly decision_id: string;
  readonly contract_id: string;
  readonly status: "READY" | "BLOCKED";
  readonly findings: readonly string[];
  readonly evaluated_at: string;
  readonly authority: "PBOS-CAPABILITY-PRODUCTION-READINESS";
  readonly digest: string;
}

export interface CapabilityOperationalMetrics {
  readonly revision: number;
  readonly capability_inventory: number;
  readonly active_entitlements: number;
  readonly trusted_issuers: number;
  readonly admission_total: number;
  readonly admission_allowed: number;
  readonly admission_denied: number;
  readonly admission_suspended: number;
  readonly admission_review_required: number;
  readonly security_events: number;
  readonly recovery_events: number;
  readonly state_digest: string;
}

export type CapabilityReadinessDomain =
  | "IDENTITY"
  | "ISSUER"
  | "STORAGE"
  | "EVIDENCE"
  | "RECOVERY"
  | "OBSERVABILITY"
  | "SECURITY"
  | "PERFORMANCE";

export interface CapabilityProductionReadinessAssessment {
  readonly assessment_id: string;
  readonly domain: CapabilityReadinessDomain;
  readonly requirement: string;
  readonly current_state: "IMPLEMENTED" | "PARTIAL" | "MISSING";
  readonly evidence: readonly string[];
  readonly validation: "PASS" | "FAIL";
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly approval_state: "APPROVED" | "PENDING" | "REJECTED";
  readonly assessed_at: string;
  readonly assessor_identity: string;
  readonly digest: string;
}

export interface CapabilityProductionCertificationDecision {
  readonly certification_id: string;
  readonly status: "CERTIFIED" | "BLOCKED";
  readonly assessment_digests: readonly string[];
  readonly findings: readonly string[];
  readonly authority: "PBOS-CAPABILITY-PRODUCTION-CERTIFICATION";
  readonly timestamp: string;
  readonly digest: string;
}
