import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../contracts";
export interface CapabilityAdmissionRequest {
  readonly schema_version: "1.0.0";
  readonly request_id: string;
  readonly subject_id: string;
  readonly tenant_id: string | null;
  readonly organization_id: string;
  readonly capability_id: string;
  readonly engine_id: string;
  readonly requested_action: string;
  readonly entitlement_reference: string;
  readonly policy_reference: string;
  readonly authority_reference: string;
  readonly requested_at: string;
  readonly content_digest: string;
}

export interface CapabilityAdmissionProof {
  readonly proof_digest: string;
  readonly control_plane_revision: number;
  readonly control_plane_digest: string;
  readonly capability: {
    readonly id: string;
    readonly content_digest: string;
    readonly owner_id: string;
    readonly owning_engine_id: string;
    readonly lifecycle_state:
      | "AVAILABLE"
      | "ACTIVATED"
      | "SUSPENDED"
      | "DEPRECATED"
      | "RETIRED"
      | "UNKNOWN";
    readonly evidence_requirement_ids: readonly string[];
    readonly security_requirement_ids: readonly string[];
    readonly dependencies_available: boolean;
  } | null;
  readonly entitlement: {
    readonly id: string;
    readonly content_digest: string;
    readonly subject_id: string;
    readonly capability_id: string;
    readonly issuer_id: string;
    readonly organization_id: string | null;
    readonly tenant_id: string | null;
    readonly status:
      | "ACTIVE"
      | "SUSPENDED"
      | "EXPIRED"
      | "REVOKED"
      | "UNKNOWN";
    readonly expires_at: string | null;
    readonly policy_reference: string;
    readonly evidence_reference: string;
  } | null;
  readonly issuer: {
    readonly id: string;
    readonly organization_id: string;
    readonly tenant_id: string | null;
    readonly trusted: boolean;
    readonly capability_allowed: boolean;
  } | null;
  readonly policy: {
    readonly id: string;
    readonly outcome: "ALLOW" | "DENY" | "REQUIRES_REVIEW";
    readonly evidence_ids: readonly string[];
  } | null;
  readonly active_revocation_ids: readonly string[];
}

export interface CapabilityAdmissionInvocation {
  readonly request: CapabilityAdmissionRequest;
  readonly identity: IdentityEnvelope;
  readonly authority: AuthorityEnvelope;
  readonly available_evidence_ids: readonly string[];
  readonly satisfied_security_requirement_ids: readonly string[];
}

export type CapabilityAdmissionOutcome =
  | "ADMITTED"
  | "DENIED"
  | "SUSPENDED"
  | "REQUIRES_REVIEW";

export interface CapabilityAdmissionDecision {
  readonly decision_id: string;
  readonly request_id: string;
  readonly decision: CapabilityAdmissionOutcome;
  readonly kernel_authority: string;
  readonly reason: readonly string[];
  readonly evidence_reference: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface CapabilityAdmissionEvidence {
  readonly evidence_id: string;
  readonly request_id: string;
  readonly request_digest: string;
  readonly decision_id: string;
  readonly decision_digest: string;
  readonly subject_id: string;
  readonly organization_id: string;
  readonly tenant_id: string | null;
  readonly capability_id: string;
  readonly capability_digest: string | null;
  readonly engine_id: string;
  readonly entitlement_reference: string;
  readonly entitlement_digest: string | null;
  readonly policy_reference: string;
  readonly policy_outcome: "ALLOW" | "DENY" | "REQUIRES_REVIEW" | "UNKNOWN";
  readonly kernel_decision: CapabilityAdmissionOutcome;
  readonly control_plane_revision: number;
  readonly control_plane_digest: string;
  readonly source_evidence_ids: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface CapabilityAdmissionEvidenceReceipt {
  readonly evidence_id: string;
  readonly evidence_digest: string;
  readonly persisted_revision: number;
}

export interface CapabilityAdmissionResult {
  readonly decision: CapabilityAdmissionDecision;
  readonly evidence: CapabilityAdmissionEvidence;
  readonly receipt: CapabilityAdmissionEvidenceReceipt;
}

export interface CapabilityAdmissionTruthSource {
  resolve(request: CapabilityAdmissionRequest): CapabilityAdmissionProof;
}

export interface CapabilityAdmissionEvidenceSink {
  record(
    decision: CapabilityAdmissionDecision,
    evidence: CapabilityAdmissionEvidence,
    expectedRevision: number
  ): CapabilityAdmissionEvidenceReceipt;
}
