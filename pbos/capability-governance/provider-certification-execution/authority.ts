import { productionProviderIntakeDigest } from "../provider-intake";
import {
  CERTIFICATION_EVIDENCE_CATEGORIES,
  type KernelProductionProofRequest,
  type ProviderCertificationAttempt,
  type ProviderCertificationDecision,
  type ProviderCertificationReview,
  type ScholarRecordActivationReadiness,
} from "./types";
import {
  certificationEvidenceChecklistDigest,
  certificationEvidenceRequirementDigest,
  kernelProductionProofRequestDigest,
  providerCertificationDecisionDigest,
  providerCertificationExecutionDigest,
  providerCertificationReviewDigest,
  scholarRecordActivationReadinessDigest,
} from "./identity";

function unique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

export class ProviderCertificationExecutionAuthority {
  constructor(
    private readonly certificationAuthorities: ReadonlySet<string>
  ) {}

  validateAttempt(
    attempt: ProviderCertificationAttempt,
    observedAt: string
  ): readonly string[] {
    const errors: string[] = [];
    const { intake, execution, checklist } = attempt;
    if (
      intake.digest !== productionProviderIntakeDigest(intake) ||
      intake.status !== "REGISTERED"
    ) {
      errors.push("provider intake identity is invalid.");
    }
    if (
      execution.digest !== providerCertificationExecutionDigest(execution) ||
      execution.provider_id !== intake.provider_id ||
      execution.provider_identity !== intake.organization_identity ||
      execution.intake_reference !== intake.intake_id ||
      execution.requested_capabilities.length === 0 ||
      execution.certification_scope.length === 0 ||
      !this.certificationAuthorities.has(execution.assigned_authority)
    ) {
      errors.push("provider certification execution is invalid.");
    }
    if (
      checklist.digest !== certificationEvidenceChecklistDigest(checklist) ||
      checklist.certification_id !== execution.certification_id ||
      checklist.provider_id !== execution.provider_id
    ) {
      errors.push("certification evidence checklist identity is invalid.");
    }
    const categories = new Set(
      checklist.requirements.map(({ requirement }) => requirement)
    );
    if (
      categories.size !== CERTIFICATION_EVIDENCE_CATEGORIES.length ||
      CERTIFICATION_EVIDENCE_CATEGORIES.some(
        (category) => !categories.has(category)
      )
    ) {
      errors.push("certification evidence checklist is incomplete.");
    }
    for (const requirement of checklist.requirements) {
      if (
        requirement.digest !==
          certificationEvidenceRequirementDigest(requirement) ||
        requirement.status !== "VERIFIED" ||
        requirement.submitted_evidence.length === 0 ||
        requirement.evidence_digests.length !==
          requirement.submitted_evidence.length ||
        requirement.evidence_digests.some((digest) => digest.length !== 64) ||
        !requirement.validator ||
        requirement.validator === requirement.provider_submitter ||
        Date.parse(requirement.expiration) <= Date.parse(observedAt)
      ) {
        errors.push(
          `certification evidence is invalid: ${requirement.requirement}.`
        );
      }
    }
    return errors;
  }

  review(
    attempt: ProviderCertificationAttempt,
    value: ProviderCertificationReview,
    providerOwner: string,
    providerOperator: string,
    observedAt: string
  ): ProviderCertificationReview {
    const errors = [...this.validateAttempt(attempt, observedAt)];
    if (
      value.digest !== providerCertificationReviewDigest(value) ||
      value.certification_id !== attempt.execution.certification_id ||
      !value.reviewer_identity ||
      value.reviewer_identity === providerOwner ||
      value.reviewer_identity === providerOperator ||
      attempt.checklist.requirements.some(
        ({ provider_submitter }) =>
          value.reviewer_identity === provider_submitter
      )
    ) {
      errors.push("provider certification reviewer is conflicted or invalid.");
    }
    const evidence = attempt.checklist.requirements.flatMap(
      ({ submitted_evidence }) => submitted_evidence
    );
    if (
      !unique(value.evidence_reviewed) ||
      evidence.some((reference) => !value.evidence_reviewed.includes(reference))
    ) {
      errors.push("provider certification review evidence is incomplete.");
    }
    if (errors.length > 0) {
      throw new Error(`Provider certification review rejected: ${errors.join(" ")}`);
    }
    return Object.freeze({
      ...value,
      evidence_reviewed: Object.freeze([...value.evidence_reviewed]),
      security_findings: Object.freeze([...value.security_findings]),
      operational_findings: Object.freeze([...value.operational_findings]),
      risk_findings: Object.freeze([...value.risk_findings]),
    });
  }

  decide(
    attempt: ProviderCertificationAttempt,
    review: ProviderCertificationReview,
    value: ProviderCertificationDecision,
    observedAt: string
  ): ProviderCertificationDecision {
    const errors = [...this.validateAttempt(attempt, observedAt)];
    if (
      review.digest !== providerCertificationReviewDigest(review) ||
      review.certification_id !== attempt.execution.certification_id ||
      value.digest !== providerCertificationDecisionDigest(value) ||
      value.certification_id !== attempt.execution.certification_id ||
      value.provider_id !== attempt.execution.provider_id ||
      value.review_reference !== review.review_id ||
      !this.certificationAuthorities.has(value.decision_authority)
    ) {
      errors.push("provider certification decision authority is invalid.");
    }
    if (
      value.decision === "CERTIFIED" &&
      (review.decision !== "RECOMMEND_CERTIFICATION" ||
        Date.parse(value.expiration) <= Date.parse(value.timestamp) ||
        value.evidence_basis.length === 0)
    ) {
      errors.push("provider certification requirements are not satisfied.");
    }
    if (errors.length > 0 && value.decision === "CERTIFIED") {
      throw new Error(`Provider certification rejected: ${errors.join(" ")}`);
    }
    return Object.freeze({
      ...value,
      evidence_basis: Object.freeze([...value.evidence_basis]),
      risk_summary: Object.freeze([...value.risk_summary, ...errors]),
    });
  }

  createProofRequest(
    decision: ProviderCertificationDecision,
    review: ProviderCertificationReview,
    value: KernelProductionProofRequest
  ): KernelProductionProofRequest {
    if (
      decision.decision !== "CERTIFIED" ||
      decision.digest !== providerCertificationDecisionDigest(decision) ||
      review.digest !== providerCertificationReviewDigest(review) ||
      value.digest !== kernelProductionProofRequestDigest(value) ||
      value.provider_identity !== decision.provider_id ||
      value.certification_identity !== decision.decision_id ||
      value.review_identity !== review.review_id ||
      value.certification_decision_digest !== decision.digest ||
      value.validated_evidence.length === 0
    ) {
      throw new Error("Kernel production proof request rejected.");
    }
    return Object.freeze({
      ...value,
      validated_evidence: Object.freeze([...value.validated_evidence]),
    });
  }
}

export function assessScholarRecordActivationReadiness(
  value: Omit<ScholarRecordActivationReadiness, "decision" | "findings" | "digest">
): ScholarRecordActivationReadiness {
  const findings: string[] = [];
  if (value.provider_certification_status !== "CERTIFIED") {
    findings.push("production provider is not certified.");
  }
  if (!value.kernel_proof_available) findings.push("Kernel proof is unavailable.");
  if (!value.storage_ready) findings.push("storage is not ready.");
  if (!value.evidence_ready) findings.push("evidence is not ready.");
  if (!value.recovery_ready) findings.push("recovery is not ready.");
  if (!value.operations_ready) findings.push("operations are not ready.");
  const decision =
    findings.length === 0
      ? "READY"
      : value.provider_certification_status === "CONDITIONAL"
        ? "CONDITIONAL"
        : "BLOCKED";
  const body: ScholarRecordActivationReadiness = {
    ...value,
    decision,
    findings,
    digest: "",
  };
  return Object.freeze({
    ...body,
    findings: Object.freeze([...findings]),
    digest: scholarRecordActivationReadinessDigest(body),
  });
}
