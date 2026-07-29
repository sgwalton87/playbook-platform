import {
  contractResult,
  requireChronology,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: prove ownership, delegation, permission, approval, policy
 * inheritance, and administrative authority for one subject and action.
 *
 * Ownership: Governance Enforcement resolves policy; domain resource owners
 * retain permission authority.
 * Validation: scope, identities, time, status, and separation are mandatory.
 * Failure behavior: incomplete or inactive authority denies the action.
 */
export interface AuthorityScope {
  readonly organizationId: string;
  readonly tenantId: string | null;
  readonly environmentId: string;
  readonly region: string;
  readonly resourceIds: readonly string[];
  readonly operations: readonly string[];
}

export interface AuthorityEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly actorId: string;
  readonly subjectId: string;
  readonly ownerId: string;
  readonly delegationIds: readonly string[];
  readonly permissionIds: readonly string[];
  readonly approvalIds: readonly string[];
  readonly policyDecisionIds: readonly string[];
  readonly administrativeAuthorityId: string | null;
  readonly scope: AuthorityScope;
  readonly status: "PENDING" | "AUTHORIZED" | "DENIED" | "REVOKED";
  readonly issuedAt: string;
  readonly expiresAt: string | null;
}

export function validateAuthorityEnvelope(
  envelope: AuthorityEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "authority.id", envelope.id);
  requireIdentifier(errors, "authority.actorId", envelope.actorId);
  requireIdentifier(errors, "authority.subjectId", envelope.subjectId);
  requireIdentifier(errors, "authority.ownerId", envelope.ownerId);
  requireIdentifier(
    errors,
    "authority.scope.organizationId",
    envelope.scope.organizationId
  );
  requireIdentifier(
    errors,
    "authority.scope.environmentId",
    envelope.scope.environmentId
  );
  requireIdentifier(errors, "authority.scope.region", envelope.scope.region);
  requireIdentifiers(
    errors,
    "authority.scope.resourceIds",
    envelope.scope.resourceIds
  );
  requireIdentifiers(
    errors,
    "authority.scope.operations",
    envelope.scope.operations
  );
  requireIdentifiers(errors, "authority.delegationIds", envelope.delegationIds);
  requireIdentifiers(errors, "authority.permissionIds", envelope.permissionIds);
  requireIdentifiers(errors, "authority.approvalIds", envelope.approvalIds);
  requireIdentifiers(
    errors,
    "authority.policyDecisionIds",
    envelope.policyDecisionIds
  );
  requireTimestamp(errors, "authority.issuedAt", envelope.issuedAt);
  if (envelope.expiresAt !== null) {
    requireTimestamp(errors, "authority.expiresAt", envelope.expiresAt);
  }
  requireChronology(
    errors,
    "authority.issuedAt",
    envelope.issuedAt,
    "authority.expiresAt",
    envelope.expiresAt
  );
  if (envelope.status !== "AUTHORIZED") {
    errors.push("authority status must be AUTHORIZED.");
  }
  if (envelope.scope.operations.length === 0) {
    errors.push("authority scope requires at least one operation.");
  }
  return contractResult(errors);
}
