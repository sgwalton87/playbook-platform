import { artifactDigest } from "../kernel/identity";
import type {
  CapabilityDefinition,
  CapabilityPolicy,
  EntitlementRecord,
} from "./types";

function capabilityContent(
  value: CapabilityDefinition
): Omit<CapabilityDefinition, "definition_digest"> {
  return {
    schema_version: value.schema_version,
    capability_id: value.capability_id,
    name: value.name,
    purpose: value.purpose,
    owner: value.owner,
    owning_engine_id: value.owning_engine_id,
    version: value.version,
    classification: value.classification,
    dependencies: value.dependencies,
    security_requirements: value.security_requirements,
    evidence_requirements: value.evidence_requirements,
    lifecycle_state: value.lifecycle_state,
  };
}

function entitlementContent(
  value: EntitlementRecord
): Omit<EntitlementRecord, "record_digest"> {
  return {
    schema_version: value.schema_version,
    entitlement_id: value.entitlement_id,
    capability_id: value.capability_id,
    capability_definition_digest: value.capability_definition_digest,
    subject_id: value.subject_id,
    beneficiary_type: value.beneficiary_type,
    organization_id: value.organization_id,
    tenant_id: value.tenant_id,
    issuer_id: value.issuer_id,
    grant_authority_id: value.grant_authority_id,
    source: value.source,
    status: value.status,
    effective_at: value.effective_at,
    expires_at: value.expires_at,
    evidence_ids: value.evidence_ids,
    policy_ids: value.policy_ids,
  };
}

function policyContent(
  value: CapabilityPolicy
): Omit<CapabilityPolicy, "policy_digest"> {
  return {
    schema_version: value.schema_version,
    policy_id: value.policy_id,
    capability_id: value.capability_id,
    capability_definition_digest: value.capability_definition_digest,
    owner: value.owner,
    allowed_beneficiary_types: value.allowed_beneficiary_types,
    allowed_sources: value.allowed_sources,
    required_permission_ids: value.required_permission_ids,
    required_evidence_ids: value.required_evidence_ids,
    status: value.status,
    effective_at: value.effective_at,
    expires_at: value.expires_at,
  };
}

export function capabilityDefinitionDigest(
  value: CapabilityDefinition
): string {
  return artifactDigest(capabilityContent(value));
}

export function entitlementRecordDigest(value: EntitlementRecord): string {
  return artifactDigest(entitlementContent(value));
}

export function capabilityPolicyDigest(value: CapabilityPolicy): string {
  return artifactDigest(policyContent(value));
}

export function createCapabilityDefinition(
  content: Omit<CapabilityDefinition, "definition_digest">
): CapabilityDefinition {
  const value = { ...content, definition_digest: "" };
  return { ...value, definition_digest: capabilityDefinitionDigest(value) };
}

export function createEntitlementRecord(
  content: Omit<EntitlementRecord, "record_digest">
): EntitlementRecord {
  const value = { ...content, record_digest: "" };
  return { ...value, record_digest: entitlementRecordDigest(value) };
}

export function createCapabilityPolicy(
  content: Omit<CapabilityPolicy, "policy_digest">
): CapabilityPolicy {
  const value = { ...content, policy_digest: "" };
  return { ...value, policy_digest: capabilityPolicyDigest(value) };
}
