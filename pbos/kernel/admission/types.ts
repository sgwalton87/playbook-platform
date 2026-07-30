import type {
  CertificationTrustEnvelope,
  UniversalLifecycleState,
} from "../contracts";

export const ENGINE_CLASSIFICATIONS = [
  "INTELLIGENCE",
  "EXPERIENCE",
  "WORKFLOW",
  "AUTOMATION",
  "AI",
  "INTEGRATION",
  "GOVERNANCE",
] as const;

export type EngineClassification = (typeof ENGINE_CLASSIFICATIONS)[number];

export const ENGINE_LIFECYCLE_STATES = [
  "PROPOSED",
  "DESIGNED",
  "REVIEWED",
  "APPROVED",
  "REGISTERED",
  "ACTIVE",
  "MONITORED",
  "UPDATED",
  "SUSPENDED",
  "DEPRECATED",
  "RETIRED",
] as const;

export type EngineLifecycleState = (typeof ENGINE_LIFECYCLE_STATES)[number];

export interface EngineCapability {
  readonly capability_id: string;
  readonly description: string;
  readonly operations: readonly string[];
}

export interface EngineLifecycleRequirements {
  readonly lifecycle_id: string;
  readonly compatible_states: readonly UniversalLifecycleState[];
}

export interface EngineManifest {
  readonly manifest_version: "1.0.0";
  readonly manifest_digest: string;
  readonly engine_id: string;
  readonly name: string;
  readonly purpose: string;
  readonly owner: string;
  readonly version: string;
  readonly classification: EngineClassification;
  readonly lifecycle_state: EngineLifecycleState;
  readonly capabilities: readonly EngineCapability[];
  readonly authority_scope: readonly string[];
  readonly required_permissions: readonly string[];
  readonly input_contracts: readonly string[];
  readonly output_contracts: readonly string[];
  readonly lifecycle_requirements: EngineLifecycleRequirements;
  readonly evidence_requirements: readonly string[];
  readonly security_requirements: readonly string[];
  readonly certification_requirements: readonly string[];
  readonly operational_requirements: readonly string[];
  readonly dependencies: readonly string[];
}

export interface EngineRegistration {
  readonly registration_id: string;
  readonly engine_id: string;
  readonly manifest_digest: string;
  readonly authority_id: string;
  readonly registered_by: string;
  readonly registered_at: string;
  readonly status: "REGISTERED" | "SUSPENDED" | "REVOKED";
}

export interface EngineAuthorityGrant {
  readonly authority_id: string;
  readonly engine_id: string;
  readonly owner: string;
  readonly capability_ids: readonly string[];
  readonly permission_ids: readonly string[];
  readonly scope_ids: readonly string[];
  readonly status: "AUTHORIZED" | "DENIED" | "SUSPENDED" | "REVOKED";
}

export interface EngineLifecycleContext {
  readonly lifecycle_id: string;
  readonly state: UniversalLifecycleState;
}

export interface EngineAdmissionRequest {
  readonly request_id: string;
  readonly manifest: EngineManifest;
  readonly registration: EngineRegistration;
  readonly authority: EngineAuthorityGrant;
  readonly lifecycle: EngineLifecycleContext;
  readonly available_dependency_ids: readonly string[];
  readonly available_evidence_requirement_ids: readonly string[];
  readonly available_security_requirement_ids: readonly string[];
  readonly available_operational_requirement_ids: readonly string[];
  readonly certifications: readonly CertificationTrustEnvelope[];
}

export interface EngineAdmissionDecision {
  readonly request_id: string;
  readonly engine_id: string;
  readonly manifest_digest: string;
  readonly status: "ADMITTED" | "REJECTED";
  readonly findings: readonly string[];
  readonly decision_digest: string;
}

export interface EngineRegistrationDecision {
  readonly engine_id: string;
  readonly manifest_digest: string;
  readonly status: "REGISTERED" | "REJECTED";
  readonly findings: readonly string[];
}
