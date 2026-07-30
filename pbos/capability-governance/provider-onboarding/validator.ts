import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import {
  productionProviderRegistrationDigest,
  providerEvidencePackageDigest,
  providerEvidenceValidationDigest,
  providerLifecycleTransitionDigest,
} from "./identity";
import {
  PRODUCTION_PROVIDER_TYPES,
  type ProductionProviderEvidencePackage,
  type ProductionProviderRegistration,
  type ProviderEvidenceValidation,
  type ProviderLifecycleState,
  type ProviderLifecycleTransition,
} from "./types";

const TRANSITIONS: Readonly<
  Record<ProviderLifecycleState, readonly ProviderLifecycleState[]>
> = {
  REGISTERED: ["EVIDENCE_REQUIRED", "SUSPENDED", "REVOKED"],
  EVIDENCE_REQUIRED: ["UNDER_REVIEW", "SUSPENDED", "REVOKED"],
  UNDER_REVIEW: ["VALIDATED", "EVIDENCE_REQUIRED", "SUSPENDED", "REVOKED"],
  VALIDATED: ["CERTIFIED", "UNDER_REVIEW", "SUSPENDED", "REVOKED"],
  CERTIFIED: ["SUSPENDED", "REVOKED"],
  SUSPENDED: ["UNDER_REVIEW", "REVOKED"],
  REVOKED: [],
};

export function validateProviderRegistration(
  value: ProductionProviderRegistration
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "provider.provider_id", value.provider_id);
  requireIdentifier(errors, "provider.provider_name", value.provider_name);
  requireIdentifier(
    errors,
    "provider.organization_identity",
    value.organization_identity
  );
  requireIdentifier(
    errors,
    "provider.ownership_information",
    value.ownership_information
  );
  requireIdentifiers(errors, "provider.service_scope", value.service_scope);
  requireIdentifiers(
    errors,
    "provider.capabilities_supported",
    value.capabilities_supported
  );
  requireIdentifier(errors, "provider.security_contact", value.security_contact);
  requireIdentifier(
    errors,
    "provider.operational_contact",
    value.operational_contact
  );
  requireTimestamp(errors, "provider.created_at", value.created_at);
  requireTimestamp(errors, "provider.updated_at", value.updated_at);
  requireDigest(errors, "provider.digest", value.digest);
  if (!PRODUCTION_PROVIDER_TYPES.includes(value.provider_type)) {
    errors.push("production provider type is unsupported.");
  }
  if (value.registration_status !== "REGISTERED") {
    errors.push("new production provider must begin REGISTERED.");
  }
  if (value.digest !== productionProviderRegistrationDigest(value)) {
    errors.push("production provider registration digest is invalid.");
  }
  return errors;
}

export function validateProviderTransition(
  value: ProviderLifecycleTransition
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "transition.transition_id", value.transition_id);
  requireIdentifier(errors, "transition.provider_id", value.provider_id);
  requireIdentifier(
    errors,
    "transition.authorized_reviewer",
    value.authorized_reviewer
  );
  requireIdentifier(errors, "transition.reason", value.reason);
  requireIdentifiers(errors, "transition.evidence", value.evidence);
  requireTimestamp(errors, "transition.timestamp", value.timestamp);
  requireDigest(errors, "transition.digest", value.digest);
  if (!TRANSITIONS[value.from].includes(value.to)) {
    errors.push(`provider lifecycle transition ${value.from} -> ${value.to} is invalid.`);
  }
  if (value.evidence.length === 0) {
    errors.push("provider lifecycle transition requires evidence.");
  }
  if (value.digest !== providerLifecycleTransitionDigest(value)) {
    errors.push("provider lifecycle transition digest is invalid.");
  }
  return errors;
}

export function validateProviderEvidencePackage(
  value: ProductionProviderEvidencePackage,
  observedAt: string
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "evidence.evidence_id", value.evidence_id);
  requireIdentifier(errors, "evidence.provider_id", value.provider_id);
  requireIdentifier(errors, "evidence.claim_type", value.claim_type);
  requireIdentifier(
    errors,
    "evidence.claim_description",
    value.claim_description
  );
  requireIdentifier(errors, "evidence.evidence_source", value.evidence_source);
  requireDigest(errors, "evidence.source_digest", value.source_digest);
  requireIdentifier(
    errors,
    "evidence.verification_method",
    value.verification_method
  );
  requireIdentifier(errors, "evidence.submitted_by", value.submitted_by);
  requireTimestamp(errors, "evidence.submitted_at", value.submitted_at);
  requireTimestamp(errors, "evidence.expiration", value.expiration);
  requireDigest(errors, "evidence.digest", value.digest);
  if (value.digest !== providerEvidencePackageDigest(value)) {
    errors.push("provider evidence package digest is invalid.");
  }
  if (
    value.status === "EXPIRED" ||
    Date.parse(value.expiration) <= Date.parse(observedAt)
  ) {
    errors.push("provider evidence package is expired.");
  }
  return errors;
}

export function validateProviderEvidenceValidation(
  value: ProviderEvidenceValidation,
  evidence: ProductionProviderEvidencePackage,
  allowedValidators: ReadonlySet<string>
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "validation.validation_id", value.validation_id);
  requireIdentifier(
    errors,
    "validation.validator_identity",
    value.validator_identity
  );
  requireIdentifier(
    errors,
    "validation.evidence_reference",
    value.evidence_reference
  );
  requireDigest(errors, "validation.evidence_digest", value.evidence_digest);
  requireIdentifier(
    errors,
    "validation.validation_method",
    value.validation_method
  );
  requireTimestamp(errors, "validation.timestamp", value.timestamp);
  requireDigest(errors, "validation.digest", value.digest);
  if (
    !allowedValidators.has(value.validator_identity) ||
    value.validator_identity === evidence.submitted_by
  ) {
    errors.push("provider evidence validator is not independent and authorized.");
  }
  if (
    value.evidence_reference !== evidence.evidence_id ||
    value.evidence_digest !== evidence.digest
  ) {
    errors.push("provider validation evidence binding is invalid.");
  }
  if (value.digest !== providerEvidenceValidationDigest(value)) {
    errors.push("provider evidence validation digest is invalid.");
  }
  return errors;
}
