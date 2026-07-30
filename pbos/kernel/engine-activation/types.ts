import type { EngineAdmissionDecision } from "../admission";
import type { CapabilityAdmissionResult } from "../capability-admission";
import type { CapabilityExecutionBindingDecision } from "../capability-execution-binding";

export interface EngineActivationRequest {
  readonly request_id: string;
  readonly engine_id: string;
  readonly capability_id: string;
  readonly owner: string;
  readonly version: string;
  readonly dependencies: readonly string[];
  readonly security_requirements: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly kernel_admission_reference: string;
  readonly lifecycle_reference: string;
  readonly organization_id: string;
  readonly tenant_id: string | null;
  readonly production_certification_reference: string;
  readonly requested_at: string;
  readonly digest: string;
}

export interface EngineActivationTrustProof {
  readonly issuer_trusted: boolean;
  readonly entitlement_valid: boolean;
  readonly issuer_decision_reference: string;
  readonly entitlement_reference: string;
  readonly evidence_references: readonly string[];
  readonly valid_until: string;
  readonly digest: string;
}

export interface ProductionCertificationProof {
  readonly certification_reference: string;
  readonly status: "CERTIFIED" | "BLOCKED";
  readonly authority: string;
  readonly evidence_references: readonly string[];
  readonly valid_until: string;
  readonly digest: string;
}

export interface EngineActivationInvocation {
  readonly request: EngineActivationRequest;
  readonly trust: EngineActivationTrustProof;
  readonly production: ProductionCertificationProof;
  readonly capability_admission: CapabilityAdmissionResult;
  readonly engine_admission: EngineAdmissionDecision;
  readonly execution_binding: CapabilityExecutionBindingDecision;
  readonly available_dependencies: readonly string[];
  readonly satisfied_security_requirements: readonly string[];
  readonly available_evidence_requirements: readonly string[];
}

export interface EngineActivationDecision {
  readonly decision_id: string;
  readonly request_id: string;
  readonly engine_id: string;
  readonly capability_id: string;
  readonly decision: "ACTIVATED" | "BLOCKED";
  readonly authority: "PBOS-KERNEL-ENGINE-ACTIVATION";
  readonly evidence: readonly string[];
  readonly findings: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}
