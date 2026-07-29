import {
  contractResult,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  type ContractValidationResult,
} from "./common";

/**
 * Purpose: record deterministic policy evaluation, approval requirements,
 * restrictions, exceptions, and escalation for one governed action.
 *
 * Ownership: Governance Enforcement owns the decision; policy owners own rules.
 * Validation: source, evaluator, evidence, scope, and outcome must be complete.
 * Failure behavior: only ALLOW is eligible for governed execution.
 */
export interface PolicyDecisionEnvelope {
  readonly version: "1.0.0";
  readonly id: string;
  readonly actionId: string;
  readonly subjectId: string;
  readonly policySourceIds: readonly string[];
  readonly evaluatorId: string;
  readonly evidenceIds: readonly string[];
  readonly requiredApprovalIds: readonly string[];
  readonly restrictionIds: readonly string[];
  readonly exceptionIds: readonly string[];
  readonly escalationId: string | null;
  readonly outcome: "ALLOW" | "DENY" | "BLOCK";
  readonly evaluatedAt: string;
  readonly rationale: readonly string[];
}

export function validatePolicyDecisionEnvelope(
  envelope: PolicyDecisionEnvelope
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "policy.id", envelope.id);
  requireIdentifier(errors, "policy.actionId", envelope.actionId);
  requireIdentifier(errors, "policy.subjectId", envelope.subjectId);
  requireIdentifier(errors, "policy.evaluatorId", envelope.evaluatorId);
  requireIdentifiers(errors, "policy.policySourceIds", envelope.policySourceIds);
  requireIdentifiers(errors, "policy.evidenceIds", envelope.evidenceIds);
  requireIdentifiers(
    errors,
    "policy.requiredApprovalIds",
    envelope.requiredApprovalIds
  );
  requireIdentifiers(errors, "policy.restrictionIds", envelope.restrictionIds);
  requireIdentifiers(errors, "policy.exceptionIds", envelope.exceptionIds);
  requireTimestamp(errors, "policy.evaluatedAt", envelope.evaluatedAt);
  if (envelope.policySourceIds.length === 0) {
    errors.push("policy decision requires at least one policy source.");
  }
  if (envelope.evidenceIds.length === 0) {
    errors.push("policy decision requires evidence.");
  }
  if (envelope.outcome !== "ALLOW") {
    errors.push("policy outcome must be ALLOW.");
  }
  return contractResult(errors);
}
