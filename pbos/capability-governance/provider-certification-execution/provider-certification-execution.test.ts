import { describe, expect, it } from "vitest";
import {
  productionProviderIntakeDigest,
  type ProductionProviderIntakeRecord,
} from "../provider-intake";
import {
  ProviderCertificationExecutionAuthority,
  assessScholarRecordActivationReadiness,
} from "./authority";
import {
  certificationEvidenceChecklistDigest,
  certificationEvidenceRequirementDigest,
  kernelProductionProofRequestDigest,
  providerCertificationDecisionDigest,
  providerCertificationExecutionDigest,
  providerCertificationReviewDigest,
} from "./identity";
import {
  CERTIFICATION_EVIDENCE_CATEGORIES,
  type CertificationEvidenceChecklist,
  type KernelProductionProofRequest,
  type ProviderCertificationAttempt,
  type ProviderCertificationDecision,
  type ProviderCertificationExecution,
  type ProviderCertificationReview,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-31T12:00:00.000Z";

function intake(): ProductionProviderIntakeRecord {
  const body: ProductionProviderIntakeRecord = {
    intake_id: "INTAKE-001",
    provider_id: "PROVIDER-001",
    provider_name: "Provider",
    provider_type: "DATABASE_PROVIDER",
    organization_identity: "PROVIDER-001",
    ownership_identity: "OWNER-001",
    service_scope: ["persistence"],
    requested_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
    technical_owner: "TECH-OWNER",
    security_owner: "SECURITY-OWNER",
    operational_owner: "OPERATOR-001",
    authorized_submitters: ["SUBMITTER-001"],
    status: "REGISTERED",
    created_at: now,
    digest: "",
  };
  return { ...body, digest: productionProviderIntakeDigest(body) };
}

function execution(): ProviderCertificationExecution {
  const body: ProviderCertificationExecution = {
    certification_id: "CERTIFICATION-001",
    provider_id: "PROVIDER-001",
    provider_identity: "PROVIDER-001",
    intake_reference: "INTAKE-001",
    requested_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
    certification_scope: ["PRODUCTION-PERSISTENCE"],
    review_status: "EVIDENCE_REVIEW",
    assigned_authority: "PBOS-CERTIFICATION-AUTHORITY",
    created_at: now,
    updated_at: now,
    digest: "",
  };
  return { ...body, digest: providerCertificationExecutionDigest(body) };
}

function checklist(expiration = later): CertificationEvidenceChecklist {
  const requirements = CERTIFICATION_EVIDENCE_CATEGORIES.map((requirement) => {
    const body = {
      requirement,
      provider_claim: `${requirement} claim`,
      submitted_evidence: [`EVIDENCE-${requirement}`],
      evidence_digests: ["a".repeat(64)],
      validator: "INDEPENDENT-VALIDATOR",
      provider_submitter: "SUBMITTER-001",
      status: "VERIFIED" as const,
      expiration,
      digest: "",
    };
    return { ...body, digest: certificationEvidenceRequirementDigest(body) };
  });
  const body: CertificationEvidenceChecklist = {
    checklist_id: "CHECKLIST-001",
    certification_id: "CERTIFICATION-001",
    provider_id: "PROVIDER-001",
    requirements,
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: certificationEvidenceChecklistDigest(body) };
}

function attempt(
  checklistValue = checklist(),
  intakeValue = intake()
): ProviderCertificationAttempt {
  return {
    intake: intakeValue,
    execution: execution(),
    checklist: checklistValue,
  };
}

function review(reviewer = "INDEPENDENT-REVIEWER"): ProviderCertificationReview {
  const body: ProviderCertificationReview = {
    review_id: "REVIEW-001",
    certification_id: "CERTIFICATION-001",
    reviewer_identity: reviewer,
    evidence_reviewed: CERTIFICATION_EVIDENCE_CATEGORIES.map(
      (category) => `EVIDENCE-${category}`
    ),
    security_findings: [],
    operational_findings: [],
    risk_findings: [],
    decision: "RECOMMEND_CERTIFICATION",
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: providerCertificationReviewDigest(body) };
}

function decision(
  outcome: ProviderCertificationDecision["decision"] = "CERTIFIED"
): ProviderCertificationDecision {
  const body: ProviderCertificationDecision = {
    decision_id: "DECISION-001",
    certification_id: "CERTIFICATION-001",
    provider_id: "PROVIDER-001",
    decision: outcome,
    decision_authority: "PBOS-CERTIFICATION-AUTHORITY",
    evidence_basis: ["CHECKLIST-001"],
    review_reference: "REVIEW-001",
    risk_summary: [],
    expiration: later,
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: providerCertificationDecisionDigest(body) };
}

function authority(): ProviderCertificationExecutionAuthority {
  return new ProviderCertificationExecutionAuthority(
    new Set(["PBOS-CERTIFICATION-AUTHORITY"])
  );
}

describe("provider certification execution", () => {
  it("executes independent review, certification, and proof request validation", () => {
    const value = authority();
    const reviewed = value.review(
      attempt(),
      review(),
      "OWNER-001",
      "OPERATOR-001",
      now
    );
    const certified = value.decide(
      attempt(),
      reviewed,
      decision(),
      now
    );
    const proofBody: KernelProductionProofRequest = {
      request_id: "PROOF-REQUEST-001",
      provider_identity: "PROVIDER-001",
      certification_identity: certified.decision_id,
      validated_evidence: reviewed.evidence_reviewed,
      review_identity: reviewed.review_id,
      certification_decision_digest: certified.digest,
      timestamp: now,
      digest: "",
    };
    const proof = {
      ...proofBody,
      digest: kernelProductionProofRequestDigest(proofBody),
    };
    expect(
      value.createProofRequest(certified, reviewed, proof)
    ).toEqual(proof);
  });

  it("rejects absent intake, incomplete or expired evidence, conflicts, and tampering", () => {
    const value = authority();
    expect(() =>
      value.review(
        attempt(checklist(), { ...intake(), digest: "b".repeat(64) }),
        review(),
        "OWNER-001",
        "OPERATOR-001",
        now
      )
    ).toThrow("intake identity is invalid");
    const incompleteBody = { ...checklist(), requirements: [], digest: "" };
    const incomplete = {
      ...incompleteBody,
      digest: certificationEvidenceChecklistDigest(incompleteBody),
    };
    expect(() =>
      value.review(
        attempt(incomplete),
        review(),
        "OWNER-001",
        "OPERATOR-001",
        now
      )
    ).toThrow("checklist is incomplete");
    expect(() =>
      value.review(
        attempt(checklist(now)),
        review(),
        "OWNER-001",
        "OPERATOR-001",
        now
      )
    ).toThrow("evidence is invalid");
    expect(() =>
      value.review(
        attempt(),
        review("OWNER-001"),
        "OWNER-001",
        "OPERATOR-001",
        now
      )
    ).toThrow("reviewer is conflicted");
    expect(() =>
      value.review(
        attempt(),
        { ...review(), risk_findings: ["TAMPERED"] },
        "OWNER-001",
        "OPERATOR-001",
        now
      )
    ).toThrow("reviewer is conflicted or invalid");
  });

  it("blocks proof and Scholar readiness without certification", () => {
    const value = authority();
    const blocked = decision("BLOCKED");
    const proofBody: KernelProductionProofRequest = {
      request_id: "PROOF-REQUEST-001",
      provider_identity: "PROVIDER-001",
      certification_identity: blocked.decision_id,
      validated_evidence: ["EVIDENCE-001"],
      review_identity: "REVIEW-001",
      certification_decision_digest: blocked.digest,
      timestamp: now,
      digest: "",
    };
    const proof = {
      ...proofBody,
      digest: kernelProductionProofRequestDigest(proofBody),
    };
    expect(() =>
      value.createProofRequest(blocked, review(), proof)
    ).toThrow("rejected");
    expect(
      assessScholarRecordActivationReadiness({
        assessment_id: "READINESS-001",
        provider_certification_status: "BLOCKED",
        kernel_proof_available: false,
        storage_ready: false,
        evidence_ready: false,
        recovery_ready: false,
        operations_ready: false,
        timestamp: now,
      }).decision
    ).toBe("BLOCKED");
  });
});
