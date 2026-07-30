import { describe, expect, it } from "vitest";
import { productionProviderEvaluationDigest } from "./identity";
import { ProductionProviderEvaluationAuthority } from "./evaluator";
import type { ProductionProviderEvaluation } from "./types";

function evaluation(): ProductionProviderEvaluation {
  const domains = [
    "IDENTITY_TRUST",
    "SECURITY_MATURITY",
    "DATA_PROTECTION",
    "RELIABILITY",
    "RECOVERY_CAPABILITY",
    "OBSERVABILITY",
    "SCALABILITY",
    "OPERATIONAL_OWNERSHIP",
    "EVIDENCE_QUALITY",
    "GOVERNANCE_ALIGNMENT",
  ] as const;
  const body: ProductionProviderEvaluation = {
    evaluation_id: "EVALUATION-001",
    provider_id: "PROVIDER-001",
    provider_type: "DATABASE_PROVIDER",
    business_identity: "ORGANIZATION-001",
    ownership: "OWNER-001",
    service_description: "Governed persistence provider.",
    supported_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
    security_profile: "SECURITY-PROFILE-001",
    availability_profile: "AVAILABILITY-PROFILE-001",
    compliance_profile: "COMPLIANCE-PROFILE-001",
    operational_profile: "OPERATIONS-PROFILE-001",
    risk_assessment: "LOW",
    domain_scores: domains.map((domain) => ({
      domain,
      score: 90,
      evidence: [`EVIDENCE-${domain}`],
      findings: [],
    })),
    evaluation_score: 90,
    evaluation_status: "READY_FOR_INTAKE",
    evaluated_at: "2026-07-30T12:00:00.000Z",
    digest: "",
  };
  return { ...body, digest: productionProviderEvaluationDigest(body) };
}

describe("production provider selection", () => {
  it("accepts complete, digest-bound evaluations deterministically", () => {
    const authority = new ProductionProviderEvaluationAuthority();
    expect(authority.evaluate(evaluation())).toEqual(evaluation());
  });

  it("rejects missing evidence and score manipulation", () => {
    const authority = new ProductionProviderEvaluationAuthority();
    const value = evaluation();
    expect(() =>
      authority.evaluate({
        ...value,
        evaluation_score: 100,
      })
    ).toThrow("digest is invalid");
    const body = {
      ...value,
      domain_scores: value.domain_scores.slice(1),
      digest: "",
    };
    const tampered = {
      ...body,
      digest: productionProviderEvaluationDigest(body),
    };
    expect(() => authority.evaluate(tampered)).toThrow(
      "domain is invalid"
    );
  });
});
