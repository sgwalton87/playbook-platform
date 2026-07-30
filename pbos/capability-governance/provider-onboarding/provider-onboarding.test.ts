import { describe, expect, it } from "vitest";
import {
  productionProviderDecisionDigest,
  type ProductionProviderCertificationDecision,
} from "../production-certification";
import {
  productionProviderRegistrationDigest,
  providerEvidencePackageDigest,
  providerEvidenceValidationDigest,
  providerLifecycleTransitionDigest,
} from "./identity";
import { createOnboardedProviderKernelProof } from "./kernel-adapter";
import { ProviderCertificationReadinessAuthority } from "./readiness";
import { ProductionProviderRegistry } from "./registry";
import type {
  ProductionProviderEvidencePackage,
  ProductionProviderRegistration,
  ProviderEvidenceCategory,
  ProviderEvidenceValidation,
  ProviderLifecycleState,
  ProviderLifecycleTransition,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-30T13:00:00.000Z";

function registry(): ProductionProviderRegistry {
  return new ProductionProviderRegistry(
    new Set(["PBOS-PROVIDER-REGISTRATION"]),
    new Set([
      "PBOS-PROVIDER-REVIEW",
      "PBOS-PROVIDER-CERTIFICATION-AUTHORITY",
    ]),
    new Set(["PBOS-INDEPENDENT-VALIDATOR"])
  );
}

function provider(): ProductionProviderRegistration {
  const body: ProductionProviderRegistration = {
    provider_id: "PROVIDER-001",
    provider_name: "Production Provider",
    provider_type: "DATABASE_PROVIDER",
    organization_identity: "ORGANIZATION-PROVIDER-001",
    ownership_information: "OWNERSHIP-RECORD-001",
    service_scope: ["capability.persistence"],
    capabilities_supported: ["CAPABILITY-SCHOLAR-RECORD"],
    security_contact: "SECURITY-CONTACT-001",
    operational_contact: "OPERATIONS-CONTACT-001",
    registration_status: "REGISTERED",
    created_at: now,
    updated_at: now,
    digest: "",
  };
  return { ...body, digest: productionProviderRegistrationDigest(body) };
}

function evidence(
  category: ProviderEvidenceCategory,
  expiration = later
): ProductionProviderEvidencePackage {
  const body: ProductionProviderEvidencePackage = {
    evidence_id: `EVIDENCE-${category}`,
    provider_id: "PROVIDER-001",
    category,
    claim_type: `${category}-CLAIM`,
    claim_description: `Independent evidence for ${category}.`,
    evidence_source: `PROVIDER-SOURCE-${category}`,
    source_digest: "a".repeat(64),
    verification_method: "INDEPENDENT-REPRODUCTION",
    submitted_by: "PROVIDER-SUBMITTER",
    submitted_at: now,
    expiration,
    status: "SUBMITTED",
    digest: "",
  };
  return { ...body, digest: providerEvidencePackageDigest(body) };
}

function validation(
  item: ProductionProviderEvidencePackage,
  validator = "PBOS-INDEPENDENT-VALIDATOR"
): ProviderEvidenceValidation {
  const body: ProviderEvidenceValidation = {
    validation_id: `VALIDATION-${item.evidence_id}`,
    validator_identity: validator,
    evidence_reference: item.evidence_id,
    evidence_digest: item.digest,
    validation_method: "INDEPENDENT-REPRODUCTION",
    validation_result: "VERIFIED",
    findings: [],
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: providerEvidenceValidationDigest(body) };
}

function transition(
  from: ProviderLifecycleState,
  to: ProviderLifecycleState,
  index: number,
  reviewer = "PBOS-PROVIDER-REVIEW"
): ProviderLifecycleTransition {
  const body: ProviderLifecycleTransition = {
    transition_id: `PROVIDER-TRANSITION-${index}`,
    provider_id: "PROVIDER-001",
    from,
    to,
    authorized_reviewer: reviewer,
    reason: `Advance provider to ${to}.`,
    evidence: [`EVIDENCE-TRANSITION-${index}`],
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: providerLifecycleTransitionDigest(body) };
}

function certification(
  status: ProductionProviderCertificationDecision["status"]
): ProductionProviderCertificationDecision {
  const body: ProductionProviderCertificationDecision = {
    certification_id: "PROVIDER-CERTIFICATION-001",
    package_id: "PROVIDER-PACKAGE-001",
    status,
    provider_record_digests: ["b".repeat(64)],
    findings: status === "CERTIFIED" ? [] : ["blocked"],
    authority: "PBOS-PRODUCTION-PROVIDER-CERTIFICATION",
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: productionProviderDecisionDigest(body) };
}

describe("PBOS production provider evidence onboarding", () => {
  it("rejects unknown providers, expired evidence, invalid validators, and tampering", () => {
    const value = registry();
    expect(() =>
      value.submit(evidence("IDENTITY_ASSURANCE"), now)
    ).toThrow("unknown provider");
    value.register(provider(), "PBOS-PROVIDER-REGISTRATION");
    expect(() =>
      value.submit(evidence("IDENTITY_ASSURANCE", now), now)
    ).toThrow("expired");
    const item = evidence("IDENTITY_ASSURANCE");
    value.submit(item, now);
    expect(() =>
      value.validate(validation(item, "PROVIDER-SUBMITTER"))
    ).toThrow("not independent");
    expect(() =>
      value.validate({
        ...validation(item),
        evidence_digest: "f".repeat(64),
      })
    ).toThrow("evidence binding is invalid");
  });

  it("remains conditional when required evidence is missing", () => {
    const value = registry();
    value.register(provider(), "PBOS-PROVIDER-REGISTRATION");
    const item = evidence("IDENTITY_ASSURANCE");
    value.submit(item, now);
    value.validate(validation(item));
    expect(
      new ProviderCertificationReadinessAuthority().assess(
        value,
        "PROVIDER-001",
        now
      )
    ).toMatchObject({
      decision: "CONDITIONAL",
      readiness_score: 17,
    });
  });

  it("gates Kernel proof on onboarding lifecycle and certification", () => {
    const value = registry();
    value.register(provider(), "PBOS-PROVIDER-REGISTRATION");
    const readinessAuthority = new ProviderCertificationReadinessAuthority();
    const blockedReadiness = readinessAuthority.assess(
      value,
      "PROVIDER-001",
      now
    );
    expect(
      createOnboardedProviderKernelProof(
        value,
        "PROVIDER-001",
        blockedReadiness,
        certification("CERTIFIED"),
        later
      ).status
    ).toBe("BLOCKED");
    const states: readonly [
      ProviderLifecycleState,
      ProviderLifecycleState,
    ][] = [
      ["REGISTERED", "EVIDENCE_REQUIRED"],
      ["EVIDENCE_REQUIRED", "UNDER_REVIEW"],
      ["UNDER_REVIEW", "VALIDATED"],
    ];
    states.forEach(([from, to], index) =>
      value.transition(transition(from, to, index + 1))
    );
    const categories: readonly ProviderEvidenceCategory[] = [
      "IDENTITY_ASSURANCE",
      "OWNERSHIP_PROOF",
      "KEY_MANAGEMENT",
      "MONITORING",
      "INCIDENT_RESPONSE",
      "RECOVERY_PROCEDURES",
    ];
    for (const category of categories) {
      const item = evidence(category);
      value.submit(item, now);
      value.validate(validation(item));
    }
    const readiness = readinessAuthority.assess(
      value,
      "PROVIDER-001",
      now
    );
    expect(readiness.decision).toBe("READY_FOR_CERTIFICATION");
    const certifiedDecision = certification("CERTIFIED");
    const certificationTransitionBody: ProviderLifecycleTransition = {
      transition_id: "PROVIDER-TRANSITION-CERTIFIED",
      provider_id: "PROVIDER-001",
      from: "VALIDATED",
      to: "CERTIFIED",
      authorized_reviewer: "PBOS-PROVIDER-CERTIFICATION-AUTHORITY",
      reason: "Provider evidence and certification are complete.",
      evidence: [readiness.digest, certifiedDecision.digest],
      timestamp: now,
      digest: "",
    };
    const certificationTransition = {
      ...certificationTransitionBody,
      digest: providerLifecycleTransitionDigest(certificationTransitionBody),
    };
    value.certify(
      certificationTransition,
      readiness,
      certifiedDecision
    );
    expect(
      createOnboardedProviderKernelProof(
        value,
        "PROVIDER-001",
        readiness,
        certification("BLOCKED"),
        later
      ).status
    ).toBe("BLOCKED");
    expect(
      createOnboardedProviderKernelProof(
        value,
        "PROVIDER-001",
        readiness,
        certifiedDecision,
        later
      ).status
    ).toBe("CERTIFIED");
  });
});
