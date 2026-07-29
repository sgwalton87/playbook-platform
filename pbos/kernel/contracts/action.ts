import { validateAuthorityEnvelope, type AuthorityEnvelope } from "./authority";
import {
  validateCertificationTrustEnvelope,
  type CertificationTrustEnvelope,
} from "./certification";
import {
  contractResult,
  mergeContractResults,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";
import { validateEvidenceEnvelope, type EvidenceEnvelope } from "./evidence";
import { validateIdentityEnvelope, type IdentityEnvelope } from "./identity";
import {
  validateLifecycleTransitionEnvelope,
  type LifecycleTransitionEnvelope,
} from "./lifecycle";
import {
  validatePolicyDecisionEnvelope,
  type PolicyDecisionEnvelope,
} from "./policy";
import { validateRecoveryEnvelope, type RecoveryEnvelope } from "./recovery";

/**
 * Purpose: provide the universal, domain-neutral PBOS action primitive.
 *
 * Ownership: the requesting engine owns domain intent; the Kernel owns
 * universal safety evaluation and dispatch eligibility.
 * Validation: identity, authority, policy, lifecycle, evidence, certification,
 * and recovery references must agree.
 * Failure behavior: any invalid or mismatched envelope blocks the action.
 */
export interface SubjectIdentity {
  readonly id: string;
  readonly engineId: string;
  readonly domain: string;
  readonly type: string;
  readonly version: string;
  readonly digest: string;
  readonly ownerId: string;
}

export interface GovernedActionEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly operation: string;
  readonly purpose: string;
  readonly requestedAt: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly identity: IdentityEnvelope;
  readonly subject: SubjectIdentity;
  readonly authority: AuthorityEnvelope;
  readonly policy: PolicyDecisionEnvelope;
  readonly lifecycle: LifecycleTransitionEnvelope | null;
  readonly evidence: readonly EvidenceEnvelope[];
  readonly certification: readonly CertificationTrustEnvelope[];
  readonly recovery: RecoveryEnvelope;
  readonly validationRequirementIds: readonly string[];
}

export function validateGovernedActionEnvelope(
  envelope: GovernedActionEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "action.id", envelope.id);
  requireIdentifier(errors, "action.operation", envelope.operation);
  requireIdentifier(errors, "action.purpose", envelope.purpose);
  requireIdentifier(errors, "action.correlationId", envelope.correlationId);
  requireIdentifier(errors, "action.idempotencyKey", envelope.idempotencyKey);
  requireTimestamp(errors, "action.requestedAt", envelope.requestedAt);
  requireIdentifier(errors, "action.subject.id", envelope.subject.id);
  requireIdentifier(errors, "action.subject.engineId", envelope.subject.engineId);
  requireIdentifier(errors, "action.subject.domain", envelope.subject.domain);
  requireIdentifier(errors, "action.subject.type", envelope.subject.type);
  requireIdentifier(errors, "action.subject.version", envelope.subject.version);
  requireIdentifier(errors, "action.subject.digest", envelope.subject.digest);
  requireIdentifier(errors, "action.subject.ownerId", envelope.subject.ownerId);
  requireIdentifiers(
    errors,
    "action.validationRequirementIds",
    envelope.validationRequirementIds
  );
  if (envelope.validationRequirementIds.length === 0) {
    errors.push("action requires at least one validation requirement.");
  }
  if (envelope.evidence.length === 0) {
    errors.push("action requires evidence.");
  }
  if (envelope.certification.length === 0) {
    errors.push("action requires certification.");
  }

  const nested = mergeContractResults(
    validateIdentityEnvelope(envelope.identity),
    validateAuthorityEnvelope(envelope.authority),
    validatePolicyDecisionEnvelope(envelope.policy),
    ...(envelope.lifecycle
      ? [validateLifecycleTransitionEnvelope(envelope.lifecycle)]
      : []),
    ...envelope.evidence.map(validateEvidenceEnvelope),
    ...envelope.certification.map(validateCertificationTrustEnvelope),
    validateRecoveryEnvelope(envelope.recovery)
  );
  errors.push(...nested.errors);

  const actorId = envelope.identity.actor.id;
  const subjectId = envelope.subject.id;
  const organizationId = envelope.identity.organization?.id ?? null;
  const tenantId = envelope.identity.tenant?.id ?? null;
  if (envelope.authority.actorId !== actorId) {
    errors.push("action actor identity does not match authority.");
  }
  if (
    envelope.authority.subjectId !== subjectId ||
    envelope.policy.subjectId !== subjectId ||
    envelope.recovery.affectedSubjectIds.some((id) => id !== subjectId)
  ) {
    errors.push("action subject identity does not match nested contracts.");
  }
  if (envelope.authority.ownerId !== envelope.subject.ownerId) {
    errors.push("action subject owner does not match authority owner.");
  }
  if (
    envelope.authority.scope.organizationId !== organizationId ||
    envelope.authority.scope.tenantId !== tenantId
  ) {
    errors.push("action organization or tenant scope does not match identity.");
  }
  if (
    envelope.policy.actionId !== envelope.id ||
    envelope.recovery.actionId !== envelope.id
  ) {
    errors.push("nested action identity does not match action.");
  }
  if (
    envelope.lifecycle &&
    envelope.lifecycle.subjectId !== envelope.subject.id
  ) {
    errors.push("lifecycle subject identity does not match action.");
  }
  if (
    envelope.evidence.some(
      (item) =>
        item.actorId !== actorId ||
        item.actionId !== envelope.id ||
        item.subjectId !== subjectId ||
        item.authorityId !== envelope.authority.id ||
        item.organizationId !== organizationId ||
        item.tenantId !== tenantId
    )
  ) {
    errors.push("evidence identity or scope does not match action.");
  }
  if (
    envelope.certification.some(
      (item) =>
        item.subjectId !== subjectId ||
        item.organizationId !== organizationId ||
        item.tenantId !== tenantId
    )
  ) {
    errors.push("certification identity or scope does not match action.");
  }
  return contractResult(errors);
}
