import { describe, expect, it } from "vitest";
import {
  CERTIFICATION_EVIDENCE_CATEGORIES,
} from "../provider-certification-execution";
import {
  ProviderCandidateOnboardingAuthority,
  assessProviderProofReadiness,
} from "./authority";
import {
  providerCandidateEvidenceRequirementDigest,
  providerCertificationCandidateDigest,
  providerCertificationEvidencePackageDigest,
  providerCertificationReviewAssignmentDigest,
} from "./identity";
import type {
  ProviderCertificationCandidate,
  ProviderCertificationEvidencePackage,
  ProviderCertificationReviewAssignment,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-31T12:00:00.000Z";

function candidate(
  overrides: Partial<ProviderCertificationCandidate> = {}
): ProviderCertificationCandidate {
  const body: ProviderCertificationCandidate = {
    candidate_id: "CANDIDATE-001",
    provider_name: "Named Candidate",
    provider_type: "DATABASE_PROVIDER",
    organization_identity: "ORGANIZATION-001",
    legal_identity_reference: "LEGAL-IDENTITY-001",
    ownership_information: "OWNER-001",
    business_contact: "BUSINESS-CONTACT-001",
    technical_contact: "TECHNICAL-CONTACT-001",
    security_contact: "SECURITY-CONTACT-001",
    operational_contact: "OPERATOR-001",
    requested_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
    service_scope: ["persistence"],
    jurisdiction: "US",
    status: "IDENTIFIED",
    created_at: now,
    updated_at: now,
    digest: "",
    ...overrides,
  };
  return { ...body, digest: providerCertificationCandidateDigest(body) };
}

function evidence(expiration = later): ProviderCertificationEvidencePackage {
  const requirements = CERTIFICATION_EVIDENCE_CATEGORIES.map((category) => {
    const body = {
      requirement_id: `REQUIREMENT-${category}`,
      candidate_id: "CANDIDATE-001",
      category,
      description: `${category} evidence`,
      required_artifact: `${category} artifact`,
      artifact_reference: `EVIDENCE-${category}`,
      artifact_digest: "a".repeat(64),
      expiration,
      validator: "INDEPENDENT-VALIDATOR",
      submitter: "PROVIDER-SUBMITTER",
      status: "VERIFIED" as const,
      digest: "",
    };
    return {
      ...body,
      digest: providerCandidateEvidenceRequirementDigest(body),
    };
  });
  const body: ProviderCertificationEvidencePackage = {
    package_id: "EVIDENCE-PACKAGE-001",
    candidate_id: "CANDIDATE-001",
    requirements,
    timestamp: now,
    digest: "",
  };
  return {
    ...body,
    digest: providerCertificationEvidencePackageDigest(body),
  };
}

function assignment(
  reviewer = "INDEPENDENT-REVIEWER",
  authority = "PBOS-REVIEW-AUTHORITY"
): ProviderCertificationReviewAssignment {
  const body: ProviderCertificationReviewAssignment = {
    assignment_id: "ASSIGNMENT-001",
    candidate_id: "CANDIDATE-001",
    reviewer_identity: reviewer,
    reviewer_authority: authority,
    conflict_check: "PASS",
    assigned_scope: ["PRODUCTION-PERSISTENCE"],
    review_deadline: later,
    status: "ASSIGNED",
    digest: "",
  };
  return {
    ...body,
    digest: providerCertificationReviewAssignmentDigest(body),
  };
}

function authority(): ProviderCandidateOnboardingAuthority {
  return new ProviderCandidateOnboardingAuthority(
    new Set(["PBOS-CANDIDATE-LIFECYCLE"]),
    new Set(["PBOS-REVIEW-AUTHORITY"])
  );
}

describe("provider candidate onboarding", () => {
  it("registers only truthful identified candidates", () => {
    const value = authority();
    value.register(candidate(), "PBOS-CANDIDATE-LIFECYCLE");
    expect(() =>
      authority().register(
        candidate({ status: "CERTIFIED" }),
        "PBOS-CANDIDATE-LIFECYCLE"
      )
    ).toThrow("registration rejected");
    expect(() =>
      authority().register(
        candidate({ ownership_information: "" }),
        "PBOS-CANDIDATE-LIFECYCLE"
      )
    ).toThrow("registration rejected");
  });

  it("blocks missing and expired evidence from readiness", () => {
    const value = authority();
    value.register(candidate(), "PBOS-CANDIDATE-LIFECYCLE");
    const emptyBody: ProviderCertificationEvidencePackage = {
      package_id: "EMPTY",
      candidate_id: "CANDIDATE-001",
      requirements: [],
      timestamp: now,
      digest: "",
    };
    const empty = {
      ...emptyBody,
      digest: providerCertificationEvidencePackageDigest(emptyBody),
    };
    expect(value.assess("CANDIDATE-001", empty, "LOW", now).decision).toBe(
      "CONDITIONAL"
    );
    expect(
      value.assess("CANDIDATE-001", evidence(now), "LOW", now).decision
    ).toBe("CONDITIONAL");
  });

  it("rejects conflicted and unauthorized reviewers", () => {
    const value = authority();
    value.register(candidate(), "PBOS-CANDIDATE-LIFECYCLE");
    expect(() =>
      value.assignReview(
        assignment("OWNER-001"),
        "OWNER-001",
        "OPERATOR-001",
        new Set(["PROVIDER-SUBMITTER"])
      )
    ).toThrow("assignment rejected");
    expect(() =>
      value.assignReview(
        assignment("INDEPENDENT-REVIEWER", "UNKNOWN"),
        "OWNER-001",
        "OPERATOR-001",
        new Set(["PROVIDER-SUBMITTER"])
      )
    ).toThrow("assignment rejected");
  });

  it("cannot prepare incomplete certification or generate production proof", () => {
    const value = authority();
    value.register(candidate(), "PBOS-CANDIDATE-LIFECYCLE");
    const readiness = value.assess(
      "CANDIDATE-001",
      evidence(),
      "LOW",
      now
    );
    expect(readiness.decision).toBe("READY");
    expect(() =>
      value.prepareSubmission(
        "CANDIDATE-001",
        evidence(),
        readiness,
        assignment(),
        {
          submission_id: "SUBMISSION-001",
          candidate_id: "CANDIDATE-001",
          candidate_digest: candidate().digest,
          evidence_package_digest: evidence().digest,
          validation_results: [],
          risk_assessment: [],
          reviewer_findings: [],
          review_assignment_reference: "ASSIGNMENT-001",
          readiness_decision: "READY",
          timestamp: now,
          digest: "a".repeat(64),
        }
      )
    ).toThrow("submission package rejected");
    expect(
      assessProviderProofReadiness({
        assessment_id: "PROOF-READINESS-001",
        candidate_id: "CANDIDATE-001",
        provider_certified: false,
        evidence_validated: true,
        certification_authority_approved: false,
        proof_requirements_satisfied: false,
        timestamp: now,
      }).decision
    ).toBe("BLOCKED");
  });
});
