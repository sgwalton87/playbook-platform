import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../kernel/contracts";
import type { EngineAdmissionDecision } from "../kernel/admission";

export const CAPABILITY_CLASSIFICATIONS = [
  "FOUNDATION",
  "INTELLIGENCE",
  "EXPERIENCE",
  "WORKFLOW",
  "AUTOMATION",
  "INTEGRATION",
  "AI",
  "GOVERNANCE",
] as const;

export type CapabilityClassification =
  (typeof CAPABILITY_CLASSIFICATIONS)[number];

export const CAPABILITY_LIFECYCLE_STATES = [
  "PROPOSED",
  "DESIGNED",
  "REVIEWED",
  "APPROVED",
  "REGISTERED",
  "AVAILABLE",
  "ACTIVATED",
  "SUSPENDED",
  "DEPRECATED",
  "RETIRED",
] as const;

export type CapabilityLifecycleState =
  (typeof CAPABILITY_LIFECYCLE_STATES)[number];

export interface CapabilityDefinition {
  readonly schema_version: "1.0.0";
  readonly definition_digest: string;
  readonly capability_id: string;
  readonly name: string;
  readonly purpose: string;
  readonly owner: string;
  readonly owning_engine_id: string;
  readonly version: string;
  readonly classification: CapabilityClassification;
  readonly dependencies: readonly string[];
  readonly security_requirements: readonly string[];
  readonly evidence_requirements: readonly string[];
  readonly lifecycle_state: CapabilityLifecycleState;
}

export const ENTITLEMENT_BENEFICIARY_TYPES = [
  "INDIVIDUAL",
  "FAMILY",
  "SCHOLAR",
  "ORGANIZATION",
  "SCHOOL",
  "DISTRICT",
  "UNIVERSITY",
  "PARTNER",
  "ENTERPRISE",
  "SPONSORED",
] as const;

export type EntitlementBeneficiaryType =
  (typeof ENTITLEMENT_BENEFICIARY_TYPES)[number];

export const ENTITLEMENT_SOURCES = [
  "SUBSCRIPTION",
  "INSTITUTION_AGREEMENT",
  "PARTNER_SPONSORSHIP",
  "PROGRAM_ENROLLMENT",
  "ADMINISTRATIVE_APPROVAL",
  "ELIGIBILITY_QUALIFICATION",
] as const;

export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];

export interface EntitlementRecord {
  readonly schema_version: "1.0.0";
  readonly record_digest: string;
  readonly entitlement_id: string;
  readonly capability_id: string;
  readonly capability_definition_digest: string;
  readonly subject_id: string;
  readonly beneficiary_type: EntitlementBeneficiaryType;
  readonly organization_id: string | null;
  readonly tenant_id: string | null;
  readonly issuer_id: string;
  readonly grant_authority_id: string;
  readonly source: EntitlementSource;
  readonly status: "PROPOSED" | "ACTIVE" | "SUSPENDED" | "EXPIRED" | "REVOKED";
  readonly effective_at: string;
  readonly expires_at: string | null;
  readonly evidence_ids: readonly string[];
  readonly policy_ids: readonly string[];
}

export interface CapabilityPolicy {
  readonly schema_version: "1.0.0";
  readonly policy_digest: string;
  readonly policy_id: string;
  readonly capability_id: string;
  readonly capability_definition_digest: string;
  readonly owner: string;
  readonly allowed_beneficiary_types: readonly EntitlementBeneficiaryType[];
  readonly allowed_sources: readonly EntitlementSource[];
  readonly required_permission_ids: readonly string[];
  readonly required_evidence_ids: readonly string[];
  readonly status: "ACTIVE" | "SUSPENDED" | "RETIRED";
  readonly effective_at: string;
  readonly expires_at: string | null;
}

export interface CapabilityActivationRequest {
  readonly request_id: string;
  readonly requested_at: string;
  readonly subject_id: string;
  readonly capability_id: string;
  readonly identity: IdentityEnvelope;
  readonly authority: AuthorityEnvelope;
  readonly engine_admission: EngineAdmissionDecision;
  readonly available_evidence_ids: readonly string[];
  readonly available_security_requirement_ids: readonly string[];
}

export type CapabilityActivationOutcome =
  | "ALLOW"
  | "DENY"
  | "SUSPEND"
  | "EXPIRED"
  | "REQUIRES_REVIEW";

export interface CapabilityActivationDecision {
  readonly request_id: string;
  readonly capability_id: string;
  readonly subject_id: string;
  readonly capability_definition_digest: string | null;
  readonly entitlement_id: string | null;
  readonly entitlement_digest: string | null;
  readonly policy_id: string | null;
  readonly engine_admission_digest: string;
  readonly outcome: CapabilityActivationOutcome;
  readonly findings: readonly string[];
  readonly evidence_ids: readonly string[];
  readonly evaluated_at: string;
  readonly decision_digest: string;
}

export interface CapabilityDecisionEvidence {
  readonly evidence_id: string;
  readonly request_id: string;
  readonly decision_digest: string;
  readonly capability_id: string;
  readonly subject_id: string;
  readonly organization_id: string | null;
  readonly tenant_id: string | null;
  readonly outcome: CapabilityActivationOutcome;
  readonly source_evidence_ids: readonly string[];
  readonly recorded_at: string;
  readonly evidence_digest: string;
}
