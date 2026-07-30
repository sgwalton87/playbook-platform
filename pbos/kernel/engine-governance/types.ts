import type {
  EngineLifecycleState,
  EngineManifest,
} from "../admission";

export interface EngineLifecycleTransition {
  readonly transition_id: string;
  readonly engine_id: string;
  readonly from: EngineLifecycleState;
  readonly to: EngineLifecycleState;
  readonly authority_id: string;
  readonly evidence_ids: readonly string[];
  readonly validation_ids: readonly string[];
  readonly audit_record_id: string;
  readonly expected_revision: number;
  readonly requested_at: string;
}

export interface EngineLifecycleDecision {
  readonly transition_id: string;
  readonly engine_id: string;
  readonly status: "APPROVED" | "REJECTED";
  readonly findings: readonly string[];
  readonly decision_digest: string;
}

export interface EngineDependencyFinding {
  readonly code:
    | "DUPLICATE_ENGINE"
    | "MISSING_DEPENDENCY"
    | "SELF_DEPENDENCY"
    | "CIRCULAR_DEPENDENCY";
  readonly engine_id: string;
  readonly dependency_id: string | null;
  readonly message: string;
}

export interface EngineDependencyGraph {
  readonly valid: boolean;
  readonly engine_ids: readonly string[];
  readonly execution_order: readonly string[];
  readonly blocked_engine_ids: readonly string[];
  readonly findings: readonly EngineDependencyFinding[];
  readonly digest: string;
}

export interface EngineOperationalSnapshot {
  readonly engine_id: string;
  readonly manifest_digest: string;
  readonly version: string;
  readonly observed_at: string;
  readonly health: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
  readonly availability_percent: number;
  readonly latency_ms: number;
  readonly error_count: number;
  readonly evidence_ids: readonly string[];
  readonly satisfied_requirement_ids: readonly string[];
  readonly governance_compliant: boolean;
}

export interface EngineHealthDecision {
  readonly engine_id: string;
  readonly status: "HEALTHY" | "UNHEALTHY";
  readonly findings: readonly string[];
  readonly decision_digest: string;
}

export interface EngineRetirementRequest {
  readonly request_id: string;
  readonly manifest: EngineManifest;
  readonly authority_id: string;
  readonly deprecation_notice_id: string;
  readonly migration_plan_id: string;
  readonly dependency_impact_review_id: string;
  readonly data_impact_review_id: string;
  readonly evidence_preservation_id: string;
  readonly certification_closure_id: string;
  readonly validation_ids: readonly string[];
  readonly requested_at: string;
}

export interface EngineRetirementDecision {
  readonly request_id: string;
  readonly engine_id: string;
  readonly status: "ELIGIBLE" | "REJECTED";
  readonly findings: readonly string[];
  readonly decision_digest: string;
}
