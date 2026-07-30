import { describe, expect, it } from "vitest";
import { ProductionProviderIntakeAuthority } from "./authority";
import {
  productionProviderIntakeDigest,
  providerEvidenceRequirementPackageDigest,
  providerEvidenceSubmissionDigest,
} from "./identity";
import type {
  ProductionProviderIntakeRecord,
  ProviderEvidenceRequirementPackage,
  ProviderEvidenceSubmission,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-31T12:00:00.000Z";

function intake(): ProductionProviderIntakeRecord {
  const body: ProductionProviderIntakeRecord = {
    intake_id: "INTAKE-001",
    provider_id: "PROVIDER-001",
    provider_name: "Provider Candidate",
    provider_type: "DATABASE_PROVIDER",
    organization_identity: "ORGANIZATION-001",
    ownership_identity: "OWNER-001",
    service_scope: ["persistence"],
    requested_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
    technical_owner: "TECHNICAL-OWNER-001",
    security_owner: "SECURITY-OWNER-001",
    operational_owner: "OPERATIONS-OWNER-001",
    authorized_submitters: ["SUBMITTER-001"],
    status: "REGISTERED",
    created_at: now,
    digest: "",
  };
  return { ...body, digest: productionProviderIntakeDigest(body) };
}

function requirements(): ProviderEvidenceRequirementPackage {
  const body: ProviderEvidenceRequirementPackage = {
    package_id: "REQUIREMENTS-001",
    provider_id: "PROVIDER-001",
    categories: ["IDENTITY_ASSURANCE", "OWNERSHIP_PROOF"],
    verification_paths: {
      IDENTITY_ASSURANCE: "INDEPENDENT-IDENTITY-VALIDATION",
      OWNERSHIP_PROOF: "INDEPENDENT-OWNERSHIP-VALIDATION",
    },
    requested_by: "PBOS-EVIDENCE-REQUEST",
    requested_at: now,
    expires_at: later,
    digest: "",
  };
  return {
    ...body,
    digest: providerEvidenceRequirementPackageDigest(body),
  };
}

function submission(
  submittedBy = "SUBMITTER-001"
): ProviderEvidenceSubmission {
  const body: ProviderEvidenceSubmission = {
    submission_id: "SUBMISSION-001",
    provider_id: "PROVIDER-001",
    requirement_package_id: "REQUIREMENTS-001",
    category: "IDENTITY_ASSURANCE",
    source_reference: "SOURCE-001",
    content_digest: "a".repeat(64),
    submitted_by: submittedBy,
    submitted_at: now,
    expiration: later,
    verification_state: "SUBMITTED",
    digest: "",
  };
  return { ...body, digest: providerEvidenceSubmissionDigest(body) };
}

function authority(): ProductionProviderIntakeAuthority {
  return new ProductionProviderIntakeAuthority(
    new Set(["PBOS-PROVIDER-REGISTRATION"]),
    new Set(["PBOS-EVIDENCE-REQUEST"])
  );
}

describe("production provider intake operations", () => {
  it("accepts a governed evidence submission", () => {
    const value = authority();
    value.register(intake(), "PBOS-PROVIDER-REGISTRATION");
    value.request(requirements());
    value.submit(submission(), now);
    expect(value.submissions("PROVIDER-001")).toHaveLength(1);
  });

  it("rejects unknown providers, unauthorized submitters, duplicates, and tampering", () => {
    const value = authority();
    expect(() => value.request(requirements())).toThrow("unknown provider");
    value.register(intake(), "PBOS-PROVIDER-REGISTRATION");
    value.request(requirements());
    expect(() => value.submit(submission("UNKNOWN"), now)).toThrow(
      "not authorized"
    );
    const valid = submission();
    value.submit(valid, now);
    expect(() => value.submit(valid, now)).toThrow("duplicated");
    expect(() =>
      value.submit({ ...valid, submission_id: "SUBMISSION-002" }, now)
    ).toThrow("digest is invalid");
  });
});
