import {
  contractResult,
  requireChronology,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "../kernel/contracts";
import {
  CAPABILITY_CLASSIFICATIONS,
  CAPABILITY_LIFECYCLE_STATES,
  ENTITLEMENT_BENEFICIARY_TYPES,
  ENTITLEMENT_SOURCES,
  type CapabilityDefinition,
  type CapabilityPolicy,
  type EntitlementRecord,
} from "./types";
import {
  capabilityDefinitionDigest,
  capabilityPolicyDigest,
  entitlementRecordDigest,
} from "./identity";

function requireNonEmpty(
  errors: string[],
  field: string,
  values: readonly string[]
): void {
  requireIdentifiers(errors, field, values);
  if (values.length === 0) errors.push(`${field} is required.`);
}

export function validateCapabilityDefinition(
  definition: CapabilityDefinition
): ContractValidationResult {
  const errors: string[] = [];
  requireDigest(
    errors,
    "capability.definition_digest",
    definition.definition_digest
  );
  requireIdentifier(errors, "capability.capability_id", definition.capability_id);
  requireIdentifier(errors, "capability.name", definition.name);
  requireIdentifier(errors, "capability.purpose", definition.purpose);
  requireIdentifier(errors, "capability.owner", definition.owner);
  requireIdentifier(
    errors,
    "capability.owning_engine_id",
    definition.owning_engine_id
  );
  requireIdentifier(errors, "capability.version", definition.version);
  if (!CAPABILITY_CLASSIFICATIONS.includes(definition.classification)) {
    errors.push("capability classification is not governed.");
  }
  if (!CAPABILITY_LIFECYCLE_STATES.includes(definition.lifecycle_state)) {
    errors.push("capability lifecycle state is not governed.");
  }
  requireIdentifiers(errors, "capability.dependencies", definition.dependencies);
  requireNonEmpty(
    errors,
    "capability.security_requirements",
    definition.security_requirements
  );
  requireNonEmpty(
    errors,
    "capability.evidence_requirements",
    definition.evidence_requirements
  );
  if (definition.dependencies.includes(definition.capability_id)) {
    errors.push("capability cannot depend on itself.");
  }
  if (definition.definition_digest !== capabilityDefinitionDigest(definition)) {
    errors.push("capability definition digest does not match content.");
  }
  return contractResult(errors);
}

export function validateEntitlementRecord(
  record: EntitlementRecord
): ContractValidationResult {
  const errors: string[] = [];
  requireDigest(errors, "entitlement.record_digest", record.record_digest);
  requireIdentifier(errors, "entitlement.entitlement_id", record.entitlement_id);
  requireIdentifier(errors, "entitlement.capability_id", record.capability_id);
  requireDigest(
    errors,
    "entitlement.capability_definition_digest",
    record.capability_definition_digest
  );
  requireIdentifier(errors, "entitlement.subject_id", record.subject_id);
  requireIdentifier(errors, "entitlement.issuer_id", record.issuer_id);
  requireIdentifier(
    errors,
    "entitlement.grant_authority_id",
    record.grant_authority_id
  );
  requireTimestamp(errors, "entitlement.effective_at", record.effective_at);
  if (record.expires_at !== null) {
    requireTimestamp(errors, "entitlement.expires_at", record.expires_at);
  }
  requireChronology(
    errors,
    "entitlement.effective_at",
    record.effective_at,
    "entitlement.expires_at",
    record.expires_at
  );
  requireNonEmpty(errors, "entitlement.evidence_ids", record.evidence_ids);
  requireNonEmpty(errors, "entitlement.policy_ids", record.policy_ids);
  if (!ENTITLEMENT_BENEFICIARY_TYPES.includes(record.beneficiary_type)) {
    errors.push("entitlement beneficiary type is not governed.");
  }
  if (!ENTITLEMENT_SOURCES.includes(record.source)) {
    errors.push("entitlement source is not governed.");
  }
  if (record.tenant_id !== null && record.organization_id === null) {
    errors.push("tenant-scoped entitlement requires organization scope.");
  }
  if (
    record.grant_authority_id === record.subject_id ||
    record.grant_authority_id === record.capability_id
  ) {
    errors.push("entitlement cannot be self-granted.");
  }
  if (record.record_digest !== entitlementRecordDigest(record)) {
    errors.push("entitlement record digest does not match content.");
  }
  return contractResult(errors);
}

export function validateCapabilityPolicy(
  policy: CapabilityPolicy
): ContractValidationResult {
  const errors: string[] = [];
  requireDigest(errors, "capability_policy.policy_digest", policy.policy_digest);
  requireIdentifier(errors, "capability_policy.policy_id", policy.policy_id);
  requireIdentifier(
    errors,
    "capability_policy.capability_id",
    policy.capability_id
  );
  requireDigest(
    errors,
    "capability_policy.capability_definition_digest",
    policy.capability_definition_digest
  );
  requireIdentifier(errors, "capability_policy.owner", policy.owner);
  requireNonEmpty(
    errors,
    "capability_policy.allowed_beneficiary_types",
    policy.allowed_beneficiary_types
  );
  requireNonEmpty(
    errors,
    "capability_policy.allowed_sources",
    policy.allowed_sources
  );
  requireNonEmpty(
    errors,
    "capability_policy.required_permission_ids",
    policy.required_permission_ids
  );
  requireNonEmpty(
    errors,
    "capability_policy.required_evidence_ids",
    policy.required_evidence_ids
  );
  requireTimestamp(errors, "capability_policy.effective_at", policy.effective_at);
  if (policy.expires_at !== null) {
    requireTimestamp(errors, "capability_policy.expires_at", policy.expires_at);
  }
  requireChronology(
    errors,
    "capability_policy.effective_at",
    policy.effective_at,
    "capability_policy.expires_at",
    policy.expires_at
  );
  if (policy.policy_digest !== capabilityPolicyDigest(policy)) {
    errors.push("capability policy digest does not match content.");
  }
  return contractResult(errors);
}
