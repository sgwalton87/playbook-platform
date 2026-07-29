import {
  contractResult,
  requireChronology,
  requireIdentifier,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: identify every human, workload, organization, tenant, service, and
 * partner that participates in PBOS.
 *
 * Ownership: the authoritative identity issuer owns verification and lifecycle.
 * Validation: consumers verify issuer, status, ownership, scope, and time.
 * Failure behavior: unverifiable identity cannot participate in governed work.
 */
export type EnterpriseIdentityKind =
  | "HUMAN"
  | "WORKLOAD"
  | "ORGANIZATION"
  | "TENANT"
  | "SERVICE"
  | "EXTERNAL_PARTNER";

export type IdentityVerificationStatus =
  | "UNVERIFIED"
  | "VERIFIED"
  | "SUSPENDED"
  | "REVOKED";

export type IdentityLifecycleState =
  | "PROVISIONED"
  | "ACTIVE"
  | "SUSPENDED"
  | "RETIRED"
  | "ARCHIVED";

export interface EnterpriseIdentity {
  readonly id: string;
  readonly kind: EnterpriseIdentityKind;
  readonly issuer: string;
  readonly verificationStatus: IdentityVerificationStatus;
  readonly ownerId: string;
  readonly organizationId: string | null;
  readonly tenantId: string | null;
  readonly lifecycleState: IdentityLifecycleState;
  readonly issuedAt: string;
  readonly verifiedAt: string | null;
  readonly expiresAt: string | null;
}

export interface IdentityEnvelope {
  readonly version: "1.0.0";
  readonly actor: EnterpriseIdentity;
  readonly organization: EnterpriseIdentity | null;
  readonly tenant: EnterpriseIdentity | null;
  readonly service: EnterpriseIdentity | null;
  readonly partner: EnterpriseIdentity | null;
}

export function validateEnterpriseIdentity(
  identity: EnterpriseIdentity
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "identity.id", identity.id);
  requireIdentifier(errors, "identity.issuer", identity.issuer);
  requireIdentifier(errors, "identity.ownerId", identity.ownerId);
  requireTimestamp(errors, "identity.issuedAt", identity.issuedAt);
  if (identity.verifiedAt !== null) {
    requireTimestamp(errors, "identity.verifiedAt", identity.verifiedAt);
  }
  if (identity.expiresAt !== null) {
    requireTimestamp(errors, "identity.expiresAt", identity.expiresAt);
  }
  requireChronology(
    errors,
    "identity.issuedAt",
    identity.issuedAt,
    "identity.expiresAt",
    identity.expiresAt
  );
  if (
    identity.verificationStatus !== "VERIFIED" ||
    identity.lifecycleState !== "ACTIVE"
  ) {
    errors.push("identity must be VERIFIED and ACTIVE.");
  }
  if (identity.kind === "TENANT" && !identity.organizationId) {
    errors.push("tenant identity requires organizationId.");
  }
  return contractResult(errors);
}

export function validateIdentityEnvelope(
  envelope: IdentityEnvelope
): ContractValidationResult {
  const errors = [...validateEnterpriseIdentity(envelope.actor).errors];
  const scoped: readonly [
    keyof Pick<IdentityEnvelope, "organization" | "tenant" | "service" | "partner">,
    EnterpriseIdentityKind,
  ][] = [
    ["organization", "ORGANIZATION"],
    ["tenant", "TENANT"],
    ["service", "SERVICE"],
    ["partner", "EXTERNAL_PARTNER"],
  ];
  for (const [field, expectedKind] of scoped) {
    const identity = envelope[field];
    if (!identity) continue;
    errors.push(...validateEnterpriseIdentity(identity).errors);
    if (identity.kind !== expectedKind) {
      errors.push(`${field} identity must have kind ${expectedKind}.`);
    }
  }
  if (
    envelope.organization &&
    envelope.actor.organizationId !== envelope.organization.id
  ) {
    errors.push("actor organization identity does not match envelope.");
  }
  if (envelope.tenant) {
    if (!envelope.organization) {
      errors.push("tenant identity requires an organization envelope.");
    }
    if (envelope.tenant.organizationId !== envelope.organization?.id) {
      errors.push("tenant organization identity does not match envelope.");
    }
    if (envelope.actor.tenantId !== envelope.tenant.id) {
      errors.push("actor tenant identity does not match envelope.");
    }
  }
  return contractResult(errors);
}
