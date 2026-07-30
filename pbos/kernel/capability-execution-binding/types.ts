import type { CapabilityAdmissionResult } from "../capability-admission";
import type { EngineAdmissionDecision } from "../admission";

export interface CapabilityExecutionBindingContract {
  readonly request_id: string;
  readonly capability_id: string;
  readonly engine_id: string;
  readonly execution_type: string;
  readonly kernel_admission_reference: string;
  readonly kernel_admission_digest: string;
  readonly engine_admission_reference: string;
  readonly engine_admission_digest: string;
  readonly lifecycle_reference: string;
  readonly authorization_reference: string;
  readonly authorization_digest: string;
  readonly evidence_reference: string;
  readonly organization_id: string;
  readonly tenant_id: string | null;
  readonly created_at: string;
  readonly digest: string;
}

export interface ExecutionAuthorizationProof {
  readonly authorization_reference: string;
  readonly authorization_digest: string;
  readonly status: "AUTHORIZED" | "DENIED" | "PENDING" | "INVALID";
  readonly valid: boolean;
  readonly findings: readonly string[];
  readonly evidence_references: readonly string[];
}

export interface ExecutionLifecycleProof {
  readonly lifecycle_reference: string;
  readonly current_state: string;
  readonly requested_transition: string;
  readonly transition_permitted: boolean;
  readonly evidence_references: readonly string[];
  readonly digest: string;
}

export interface CapabilityExecutionBindingRequest {
  readonly contract: CapabilityExecutionBindingContract;
  readonly capability_admission: CapabilityAdmissionResult;
  readonly engine_admission: EngineAdmissionDecision;
  readonly authorization: ExecutionAuthorizationProof;
  readonly lifecycle: ExecutionLifecycleProof;
  readonly available_evidence_references: readonly string[];
}

export interface CapabilityExecutionBindingDecision {
  readonly decision_id: string;
  readonly binding_digest: string;
  readonly outcome: "ELIGIBLE" | "BLOCKED";
  readonly kernel_authority: "PBOS-KERNEL-CAPABILITY-EXECUTION-BINDING";
  readonly findings: readonly string[];
  readonly evidence_reference: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface CapabilityExecutionBindingEvidence {
  readonly evidence_id: string;
  readonly contract: CapabilityExecutionBindingContract;
  readonly decision: CapabilityExecutionBindingDecision;
  readonly source_evidence_references: readonly string[];
  readonly digest: string;
}

export interface CapabilityExecutionEvidenceSink {
  record(
    evidence: CapabilityExecutionBindingEvidence,
    expectedControlPlaneRevision: number
  ): { readonly evidence_id: string; readonly persisted_revision: number };
}
