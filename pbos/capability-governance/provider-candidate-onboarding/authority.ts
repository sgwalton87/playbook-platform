import {
  CERTIFICATION_EVIDENCE_CATEGORIES,
} from "../provider-certification-execution";
import {
  providerCandidateEvidenceRequirementDigest,
  providerCandidateTransitionDigest,
  providerCertificationCandidateDigest,
  providerCertificationEvidencePackageDigest,
  providerCertificationReadinessDigest,
  providerCertificationReviewAssignmentDigest,
  providerCertificationSubmissionPackageDigest,
  providerProofReadinessDigest,
} from "./identity";
import type {
  ProviderCandidateStatus,
  ProviderCandidateTransition,
  ProviderCertificationCandidate,
  ProviderCertificationEvidencePackage,
  ProviderCertificationReadinessAssessment,
  ProviderCertificationReviewAssignment,
  ProviderCertificationSubmissionPackage,
  ProviderProofReadinessAssessment,
} from "./types";

const TRANSITIONS: Readonly<
  Record<ProviderCandidateStatus, readonly ProviderCandidateStatus[]>
> = {
  IDENTIFIED: ["INVITED", "REJECTED", "WITHDRAWN"],
  INVITED: ["REGISTERED", "REJECTED", "WITHDRAWN"],
  REGISTERED: ["EVIDENCE_REQUESTED", "REJECTED", "WITHDRAWN"],
  EVIDENCE_REQUESTED: ["EVIDENCE_SUBMITTED", "REJECTED", "WITHDRAWN"],
  EVIDENCE_SUBMITTED: ["UNDER_REVIEW", "EVIDENCE_REQUESTED", "REJECTED", "WITHDRAWN"],
  UNDER_REVIEW: ["CERTIFICATION_READY", "EVIDENCE_REQUESTED", "REJECTED", "WITHDRAWN"],
  CERTIFICATION_READY: ["CERTIFIED", "UNDER_REVIEW", "REJECTED", "WITHDRAWN"],
  CERTIFIED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export class ProviderCandidateOnboardingAuthority {
  readonly #candidates = new Map<string, ProviderCertificationCandidate>();

  constructor(
    private readonly lifecycleAuthorities: ReadonlySet<string>,
    private readonly reviewerAuthorities: ReadonlySet<string>
  ) {}

  register(value: ProviderCertificationCandidate, authority: string): void {
    if (
      !this.lifecycleAuthorities.has(authority) ||
      value.status !== "IDENTIFIED" ||
      !value.candidate_id ||
      !value.organization_identity ||
      !value.legal_identity_reference ||
      !value.ownership_information ||
      !value.business_contact ||
      !value.technical_contact ||
      !value.security_contact ||
      !value.operational_contact ||
      value.requested_capabilities.length === 0 ||
      value.service_scope.length === 0 ||
      !value.jurisdiction ||
      value.digest !== providerCertificationCandidateDigest(value) ||
      this.#candidates.has(value.candidate_id)
    ) {
      throw new Error("Provider candidate registration rejected.");
    }
    this.#candidates.set(value.candidate_id, structuredClone(value));
  }

  transition(value: ProviderCandidateTransition): void {
    const candidate = this.#candidates.get(value.candidate_id);
    if (
      !candidate ||
      !this.lifecycleAuthorities.has(value.authority) ||
      candidate.status !== value.from ||
      !TRANSITIONS[value.from].includes(value.to) ||
      value.to === "CERTIFIED" ||
      !value.actor ||
      !value.reason ||
      !value.evidence_reference ||
      value.digest !== providerCandidateTransitionDigest(value)
    ) {
      throw new Error("Provider candidate transition rejected.");
    }
    const updated: ProviderCertificationCandidate = {
      ...candidate,
      status: value.to,
      updated_at: value.timestamp,
      digest: "",
    };
    this.#candidates.set(value.candidate_id, {
      ...updated,
      digest: providerCertificationCandidateDigest(updated),
    });
  }

  assess(
    candidateId: string,
    evidence: ProviderCertificationEvidencePackage,
    riskProfile: ProviderCertificationReadinessAssessment["risk_profile"],
    observedAt: string
  ): ProviderCertificationReadinessAssessment {
    const candidate = this.#candidates.get(candidateId);
    const findings: string[] = [];
    if (!candidate || evidence.candidate_id !== candidateId) {
      findings.push("candidate identity is unknown.");
    }
    if (evidence.digest !== providerCertificationEvidencePackageDigest(evidence)) {
      findings.push("evidence package digest is invalid.");
    }
    const categories = new Set(evidence.requirements.map(({ category }) => category));
    if (
      categories.size !== CERTIFICATION_EVIDENCE_CATEGORIES.length ||
      CERTIFICATION_EVIDENCE_CATEGORIES.some((category) => !categories.has(category))
    ) {
      findings.push("required evidence is incomplete.");
    }
    for (const requirement of evidence.requirements) {
      if (
        requirement.digest !== providerCandidateEvidenceRequirementDigest(requirement) ||
        requirement.status !== "VERIFIED" ||
        !requirement.artifact_reference ||
        requirement.artifact_digest?.length !== 64 ||
        !requirement.validator ||
        requirement.validator === requirement.submitter ||
        Date.parse(requirement.expiration) <= Date.parse(observedAt)
      ) {
        findings.push(`evidence is invalid: ${requirement.category}.`);
      }
    }
    const identityReady = Boolean(
      candidate?.legal_identity_reference &&
        candidate.ownership_information &&
        categories.has("IDENTITY") &&
        categories.has("OWNERSHIP")
    );
    const evidenceComplete = findings.length === 0;
    const securityReady = evidenceComplete && categories.has("SECURITY");
    const operationsReady = evidenceComplete && categories.has("OPERATIONS");
    const recoveryReady = evidenceComplete && categories.has("RECOVERY");
    const governanceAligned = Boolean(candidate) && riskProfile !== "CRITICAL";
    const decision =
      evidenceComplete &&
      identityReady &&
      securityReady &&
      operationsReady &&
      recoveryReady &&
      governanceAligned &&
      riskProfile !== "HIGH"
        ? "READY"
        : candidate && findings.length > 0 && riskProfile !== "CRITICAL"
          ? "CONDITIONAL"
          : "BLOCKED";
    const body: ProviderCertificationReadinessAssessment = {
      assessment_id: `CANDIDATE-READINESS-${candidateId}`,
      candidate_id: candidateId,
      identity_ready: identityReady,
      security_ready: securityReady,
      operations_ready: operationsReady,
      recovery_ready: recoveryReady,
      evidence_complete: evidenceComplete,
      risk_profile: riskProfile,
      governance_aligned: governanceAligned,
      decision,
      findings,
      timestamp: observedAt,
      digest: "",
    };
    return {
      ...body,
      digest: providerCertificationReadinessDigest(body),
    };
  }

  assignReview(
    value: ProviderCertificationReviewAssignment,
    candidateOwner: string,
    candidateOperator: string,
    submitters: ReadonlySet<string>
  ): ProviderCertificationReviewAssignment {
    if (
      !this.#candidates.has(value.candidate_id) ||
      !this.reviewerAuthorities.has(value.reviewer_authority) ||
      value.conflict_check !== "PASS" ||
      value.reviewer_identity === candidateOwner ||
      value.reviewer_identity === candidateOperator ||
      submitters.has(value.reviewer_identity) ||
      value.assigned_scope.length === 0 ||
      value.status !== "ASSIGNED" ||
      value.digest !== providerCertificationReviewAssignmentDigest(value)
    ) {
      throw new Error("Provider candidate review assignment rejected.");
    }
    return structuredClone(value);
  }

  prepareSubmission(
    candidateId: string,
    evidence: ProviderCertificationEvidencePackage,
    readiness: ProviderCertificationReadinessAssessment,
    assignment: ProviderCertificationReviewAssignment,
    value: ProviderCertificationSubmissionPackage
  ): ProviderCertificationSubmissionPackage {
    const candidate = this.#candidates.get(candidateId);
    if (
      !candidate ||
      readiness.decision !== "READY" ||
      readiness.digest !== providerCertificationReadinessDigest(readiness) ||
      evidence.digest !== providerCertificationEvidencePackageDigest(evidence) ||
      assignment.status !== "COMPLETED" ||
      assignment.digest !== providerCertificationReviewAssignmentDigest(assignment) ||
      value.candidate_digest !== candidate.digest ||
      value.evidence_package_digest !== evidence.digest ||
      value.review_assignment_reference !== assignment.assignment_id ||
      value.readiness_decision !== "READY" ||
      value.validation_results.length === 0 ||
      value.reviewer_findings.length === 0 ||
      value.digest !== providerCertificationSubmissionPackageDigest(value)
    ) {
      throw new Error("Provider certification submission package rejected.");
    }
    return structuredClone(value);
  }
}

export function assessProviderProofReadiness(
  value: Omit<ProviderProofReadinessAssessment, "decision" | "findings" | "digest">
): ProviderProofReadinessAssessment {
  const findings: string[] = [];
  if (!value.provider_certified) findings.push("provider is not certified.");
  if (!value.evidence_validated) findings.push("evidence is not validated.");
  if (!value.certification_authority_approved) {
    findings.push("certification authority has not approved.");
  }
  if (!value.proof_requirements_satisfied) {
    findings.push("Kernel proof requirements are not satisfied.");
  }
  const decision =
    findings.length === 0
      ? "READY"
      : value.provider_certified
        ? "CONDITIONAL"
        : "BLOCKED";
  const body: ProviderProofReadinessAssessment = {
    ...value,
    decision,
    findings,
    digest: "",
  };
  return { ...body, digest: providerProofReadinessDigest(body) };
}
