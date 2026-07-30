import type {
  CapabilityActivationOutcome,
  CapabilityClassification,
} from "../types";

export type PersistentCapabilityLifecycleState =
  | "PROPOSED"
  | "DESIGNED"
  | "APPROVED"
  | "AVAILABLE"
  | "ACTIVATED"
  | "SUSPENDED"
  | "DEPRECATED"
  | "RETIRED";

export interface CapabilityRegistryRecord {
  readonly record_revision: number;
  readonly capability_id: string;
  readonly name: string;
  readonly description: string;
  readonly owning_engine: string;
  readonly owner_identity: string;
  readonly classification: CapabilityClassification;
  readonly version: string;
  readonly dependencies: readonly string[];
  readonly security_requirements: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly lifecycle_state: PersistentCapabilityLifecycleState;
  readonly approval_authority: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly content_digest: string;
}

export interface CapabilityLifecycleTransitionRecord {
  readonly transition_id: string;
  readonly capability_id: string;
  readonly previous_state: PersistentCapabilityLifecycleState;
  readonly new_state: PersistentCapabilityLifecycleState;
  readonly authorized_actor: string;
  readonly reason: string;
  readonly evidence_ids: readonly string[];
  readonly validation_ids: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export const PERSISTENT_ENTITLEMENT_SOURCES = [
  "INDIVIDUAL_SUBSCRIPTION",
  "FAMILY_PLAN",
  "SCHOOL_LICENSE",
  "DISTRICT_AGREEMENT",
  "UNIVERSITY_PARTNERSHIP",
  "ENTERPRISE_LICENSE",
  "SPONSORED_PROGRAM",
  "ADMINISTRATIVE_GRANT",
] as const;

export type PersistentEntitlementSource =
  (typeof PERSISTENT_ENTITLEMENT_SOURCES)[number];

export interface PersistentEntitlementRecord {
  readonly record_revision: number;
  readonly entitlement_id: string;
  readonly subject_id: string;
  readonly organization_id: string | null;
  readonly tenant_id: string | null;
  readonly capability_id: string;
  readonly issuer_id: string;
  readonly source_type: PersistentEntitlementSource;
  readonly status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "REVOKED";
  readonly issued_at: string;
  readonly expires_at: string | null;
  readonly revoked_at: string | null;
  readonly policy_reference: string;
  readonly evidence_reference: string;
  readonly content_digest: string;
}

export interface CapabilityIssuerRecord {
  readonly record_revision: number;
  readonly issuer_id: string;
  readonly identity: string;
  readonly organization: string;
  readonly tenant_id: string | null;
  readonly authority_scope: readonly string[];
  readonly allowed_capabilities: readonly string[];
  readonly verification_status: "VERIFIED" | "UNVERIFIED" | "REVOKED";
  readonly lifecycle_state: "ACTIVE" | "SUSPENDED" | "RETIRED";
  readonly issued_credentials: readonly string[];
  readonly valid_from: string;
  readonly expires_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly content_digest: string;
}

export type RevocationTargetType =
  | "ENTITLEMENT"
  | "ISSUER"
  | "CAPABILITY"
  | "ORGANIZATION";

export interface CapabilityRevocationRecord {
  readonly revocation_id: string;
  readonly target_type: RevocationTargetType;
  readonly target_id: string;
  readonly authority_id: string;
  readonly reason: string;
  readonly evidence_ids: readonly string[];
  readonly revoked_at: string;
  readonly digest: string;
}

export interface CapabilityActivationDecisionRecord {
  readonly decision_id: string;
  readonly subject: string;
  readonly organization_id: string | null;
  readonly tenant_id: string | null;
  readonly capability: string;
  readonly capability_digest: string;
  readonly entitlement_reference: string | null;
  readonly policy_result: string;
  readonly authority_result: string;
  readonly kernel_reference: string;
  readonly decision: CapabilityActivationOutcome;
  readonly timestamp: string;
  readonly evidence_digest: string;
  readonly content_digest: string;
}

export interface CapabilityGovernanceEvidenceRecord {
  readonly evidence_id: string;
  readonly subject_id: string;
  readonly event_id: string;
  readonly authority_id: string;
  readonly source_evidence_ids: readonly string[];
  readonly payload: string;
  readonly payload_digest: string;
  readonly recorded_at: string;
  readonly content_digest: string;
}

export type CapabilityControlPlaneEventType =
  | "CAPABILITY_REGISTERED"
  | "CAPABILITY_TRANSITIONED"
  | "ISSUER_REGISTERED"
  | "ENTITLEMENT_ISSUED"
  | "REVOCATION_RECORDED"
  | "ACTIVATION_DECISION_RECORDED"
  | "EVIDENCE_RECORDED";

export interface CapabilityControlPlaneEvent {
  readonly sequence: number;
  readonly event_id: string;
  readonly event_type: CapabilityControlPlaneEventType;
  readonly subject_id: string;
  readonly authority_id: string;
  readonly evidence_ids: readonly string[];
  readonly timestamp: string;
  readonly payload_digest: string;
  readonly previous_event_digest: string | null;
  readonly event_digest: string;
}

export interface CapabilityControlPlaneState {
  readonly schema_version: "1.0.0";
  readonly authority: "PBOS_CAPABILITY_CONTROL_PLANE";
  readonly revision: number;
  readonly updated_at: string;
  readonly capabilities: readonly CapabilityRegistryRecord[];
  readonly capability_transitions: readonly CapabilityLifecycleTransitionRecord[];
  readonly entitlements: readonly PersistentEntitlementRecord[];
  readonly issuers: readonly CapabilityIssuerRecord[];
  readonly revocations: readonly CapabilityRevocationRecord[];
  readonly activation_decisions: readonly CapabilityActivationDecisionRecord[];
  readonly evidence: readonly CapabilityGovernanceEvidenceRecord[];
  readonly events: readonly CapabilityControlPlaneEvent[];
  readonly state_digest: string;
}

export interface CapabilityControlPlaneHealth {
  readonly revision: number;
  readonly capability_count: number;
  readonly available_capability_count: number;
  readonly active_entitlement_count: number;
  readonly revoked_entitlement_count: number;
  readonly trusted_issuer_count: number;
  readonly activation_decision_count: number;
  readonly security_event_count: number;
  readonly latest_event_digest: string | null;
  readonly state_digest: string;
}
