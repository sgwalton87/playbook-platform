import {
  contractResult,
  requireChronology,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "../kernel/contracts";
import { artifactDigest } from "../kernel/identity";

export const PRODUCT_TIERS = [
  "FREE_ACCESS",
  "PREMIUM_INDIVIDUAL",
  "FAMILY_PLAN",
  "INSTITUTION_LICENSE",
  "ENTERPRISE_LICENSE",
  "PARTNER_SPONSORSHIP",
  "PROGRAM_ACCESS",
] as const;

export type ProductTier = (typeof PRODUCT_TIERS)[number];

export interface EntitlementBundleDefinition {
  readonly schema_version: "1.0.0";
  readonly bundle_digest: string;
  readonly bundle_id: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly product_tier: ProductTier;
  readonly capability_ids: readonly string[];
  readonly policy_ids: readonly string[];
  readonly evidence_ids: readonly string[];
  readonly status: "DRAFT" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "RETIRED";
  readonly effective_at: string;
  readonly expires_at: string | null;
}

export interface CommercialEntitlementRequest {
  readonly schema_version: "1.0.0";
  readonly request_digest: string;
  readonly request_id: string;
  readonly bundle_id: string;
  readonly bundle_digest: string;
  readonly beneficiary_id: string;
  readonly organization_id: string | null;
  readonly tenant_id: string | null;
  readonly agreement_id: string;
  readonly commercial_authority_id: string;
  readonly entitlement_issuer_id: string;
  readonly evidence_ids: readonly string[];
  readonly requested_at: string;
}

function bundleContent(
  value: EntitlementBundleDefinition
): Omit<EntitlementBundleDefinition, "bundle_digest"> {
  return {
    schema_version: value.schema_version,
    bundle_id: value.bundle_id,
    name: value.name,
    owner: value.owner,
    version: value.version,
    product_tier: value.product_tier,
    capability_ids: value.capability_ids,
    policy_ids: value.policy_ids,
    evidence_ids: value.evidence_ids,
    status: value.status,
    effective_at: value.effective_at,
    expires_at: value.expires_at,
  };
}

function requestContent(
  value: CommercialEntitlementRequest
): Omit<CommercialEntitlementRequest, "request_digest"> {
  return {
    schema_version: value.schema_version,
    request_id: value.request_id,
    bundle_id: value.bundle_id,
    bundle_digest: value.bundle_digest,
    beneficiary_id: value.beneficiary_id,
    organization_id: value.organization_id,
    tenant_id: value.tenant_id,
    agreement_id: value.agreement_id,
    commercial_authority_id: value.commercial_authority_id,
    entitlement_issuer_id: value.entitlement_issuer_id,
    evidence_ids: value.evidence_ids,
    requested_at: value.requested_at,
  };
}

export function createEntitlementBundleDefinition(
  content: Omit<EntitlementBundleDefinition, "bundle_digest">
): EntitlementBundleDefinition {
  const value = { ...content, bundle_digest: "" };
  return { ...value, bundle_digest: artifactDigest(bundleContent(value)) };
}

export function createCommercialEntitlementRequest(
  content: Omit<CommercialEntitlementRequest, "request_digest">
): CommercialEntitlementRequest {
  const value = { ...content, request_digest: "" };
  return { ...value, request_digest: artifactDigest(requestContent(value)) };
}

export function validateEntitlementBundleDefinition(
  bundle: EntitlementBundleDefinition
): ContractValidationResult {
  const errors: string[] = [];
  requireDigest(errors, "bundle.bundle_digest", bundle.bundle_digest);
  requireIdentifier(errors, "bundle.bundle_id", bundle.bundle_id);
  requireIdentifier(errors, "bundle.name", bundle.name);
  requireIdentifier(errors, "bundle.owner", bundle.owner);
  requireIdentifier(errors, "bundle.version", bundle.version);
  requireIdentifiers(errors, "bundle.capability_ids", bundle.capability_ids);
  requireIdentifiers(errors, "bundle.policy_ids", bundle.policy_ids);
  requireIdentifiers(errors, "bundle.evidence_ids", bundle.evidence_ids);
  requireTimestamp(errors, "bundle.effective_at", bundle.effective_at);
  if (bundle.expires_at !== null) {
    requireTimestamp(errors, "bundle.expires_at", bundle.expires_at);
  }
  requireChronology(
    errors,
    "bundle.effective_at",
    bundle.effective_at,
    "bundle.expires_at",
    bundle.expires_at
  );
  if (!PRODUCT_TIERS.includes(bundle.product_tier)) {
    errors.push("bundle product tier is not governed.");
  }
  if (
    bundle.capability_ids.length === 0 ||
    bundle.policy_ids.length === 0 ||
    bundle.evidence_ids.length === 0
  ) {
    errors.push("bundle requires capabilities, policies, and evidence.");
  }
  if (bundle.status !== "APPROVED" && bundle.status !== "ACTIVE") {
    errors.push("bundle must be APPROVED or ACTIVE for entitlement requests.");
  }
  if (bundle.bundle_digest !== artifactDigest(bundleContent(bundle))) {
    errors.push("bundle digest does not match content.");
  }
  return contractResult(errors);
}

export function validateCommercialEntitlementRequest(
  request: CommercialEntitlementRequest,
  bundle: EntitlementBundleDefinition
): ContractValidationResult {
  const errors = [...validateEntitlementBundleDefinition(bundle).errors];
  requireDigest(errors, "commercial_request.request_digest", request.request_digest);
  requireIdentifier(errors, "commercial_request.request_id", request.request_id);
  requireIdentifier(
    errors,
    "commercial_request.beneficiary_id",
    request.beneficiary_id
  );
  requireIdentifier(
    errors,
    "commercial_request.agreement_id",
    request.agreement_id
  );
  requireIdentifier(
    errors,
    "commercial_request.commercial_authority_id",
    request.commercial_authority_id
  );
  requireIdentifier(
    errors,
    "commercial_request.entitlement_issuer_id",
    request.entitlement_issuer_id
  );
  requireIdentifiers(
    errors,
    "commercial_request.evidence_ids",
    request.evidence_ids
  );
  requireTimestamp(errors, "commercial_request.requested_at", request.requested_at);
  if (
    request.bundle_id !== bundle.bundle_id ||
    request.bundle_digest !== bundle.bundle_digest
  ) {
    errors.push("commercial request bundle identity does not match.");
  }
  if (request.tenant_id !== null && request.organization_id === null) {
    errors.push("tenant-scoped commercial request requires organization scope.");
  }
  if (
    request.commercial_authority_id === request.beneficiary_id ||
    request.entitlement_issuer_id === request.beneficiary_id
  ) {
    errors.push("beneficiary cannot grant or issue its own entitlement.");
  }
  if (request.evidence_ids.length === 0) {
    errors.push("commercial request requires agreement evidence.");
  }
  if (request.request_digest !== artifactDigest(requestContent(request))) {
    errors.push("commercial request digest does not match content.");
  }
  return contractResult(errors);
}
