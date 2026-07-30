import { describe, expect, it } from "vitest";
import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../../kernel/contracts";
import {
  credentialValidationEvidenceDigest,
  issuerIdentityContractDigest,
  issuerTrustRequestDigest,
} from "./identity";
import { CapabilityIssuerTrustAuthority } from "./authority";
import type {
  CapabilityIssuerIdentityContract,
  CredentialValidationEvidence,
  IssuerTrustRequest,
} from "./types";

const evaluatedAt = "2026-07-29T12:00:00.000Z";
const expiration = "2027-07-29T00:00:00.000Z";

function issuer(
  overrides: Partial<CapabilityIssuerIdentityContract> = {}
): CapabilityIssuerIdentityContract {
  const body: CapabilityIssuerIdentityContract = {
    issuer_id: "ISSUER-001",
    identity_reference: "WORKLOAD-ISSUER-001",
    organization_reference: "ORGANIZATION-001",
    tenant_reference: "TENANT-001",
    credential_reference: "CREDENTIAL-001",
    authority_scope: ["entitlement.issue"],
    allowed_capabilities: ["CAPABILITY-001"],
    verification_status: "VERIFIED",
    credential_expiration: expiration,
    revocation_status: "ACTIVE",
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    digest: "",
    ...overrides,
  };
  return { ...body, digest: issuerIdentityContractDigest(body) };
}

function identity(tenantId = "TENANT-001"): IdentityEnvelope {
  return {
    version: "1.0.0",
    actor: {
      id: "WORKLOAD-ISSUER-001",
      kind: "WORKLOAD",
      issuer: "PBOS-IDENTITY",
      verificationStatus: "VERIFIED",
      ownerId: "PLATFORM-OWNER",
      organizationId: "ORGANIZATION-001",
      tenantId,
      lifecycleState: "ACTIVE",
      issuedAt: "2026-07-01T00:00:00.000Z",
      verifiedAt: "2026-07-01T00:00:00.000Z",
      expiresAt: expiration,
    },
    organization: null,
    tenant: null,
    service: null,
    partner: null,
  };
}

function authority(tenantId = "TENANT-001"): AuthorityEnvelope {
  return {
    version: "1.0.0",
    id: "AUTHORITY-ISSUER-001",
    actorId: "WORKLOAD-ISSUER-001",
    subjectId: "ISSUER-001",
    ownerId: "PLATFORM-OWNER",
    delegationIds: ["DELEGATION-001"],
    permissionIds: ["PERMISSION-ENTITLEMENT-ISSUE"],
    approvalIds: ["APPROVAL-ISSUER-001"],
    policyDecisionIds: ["POLICY-ISSUER-001"],
    administrativeAuthorityId: null,
    scope: {
      organizationId: "ORGANIZATION-001",
      tenantId,
      environmentId: "PRODUCTION",
      region: "GLOBAL",
      resourceIds: ["CAPABILITY-001"],
      operations: ["entitlement.issue"],
    },
    status: "AUTHORIZED",
    issuedAt: "2026-07-01T00:00:00.000Z",
    expiresAt: expiration,
  };
}

function request(
  overrides: Partial<IssuerTrustRequest> = {}
): IssuerTrustRequest {
  const body: IssuerTrustRequest = {
    request_id: "ISSUER-TRUST-REQUEST-001",
    issuer: issuer(),
    identity: identity(),
    authority: authority(),
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    capability_id: "CAPABILITY-001",
    operation: "entitlement.issue",
    evaluated_at: evaluatedAt,
    digest: "",
    ...overrides,
  };
  return { ...body, digest: issuerTrustRequestDigest(body) };
}

function verifier(
  overrides: Partial<CredentialValidationEvidence> = {}
) {
  return {
    verify(contract: CapabilityIssuerIdentityContract) {
      const body: CredentialValidationEvidence = {
        credential_reference: contract.credential_reference,
        identity_reference: contract.identity_reference,
        validator_identity: "PBOS-SECURITY-CREDENTIAL-VALIDATOR",
        cryptographically_valid: true,
        validated_at: evaluatedAt,
        expires_at: expiration,
        revocation_checked_at: evaluatedAt,
        evidence_reference: "EVIDENCE-CREDENTIAL-001",
        digest: "",
        ...overrides,
      };
      return {
        ...body,
        digest: credentialValidationEvidenceDigest(body),
      };
    },
  };
}

describe("PBOS capability issuer identity trust", () => {
  it("trusts a cryptographically verified issuer with exact authority", () => {
    const decision = new CapabilityIssuerTrustAuthority(verifier()).evaluate(
      request()
    );
    expect(decision).toMatchObject({
      outcome: "TRUSTED",
      authority_identity: "PBOS-CAPABILITY-ISSUER-TRUST",
      findings: [],
    });
  });

  it.each([
    ["expired credential", verifier({ expires_at: evaluatedAt })],
    [
      "credential mismatch",
      verifier({ credential_reference: "CREDENTIAL-OTHER" }),
    ],
    [
      "cryptographic failure",
      verifier({ cryptographically_valid: false }),
    ],
  ])("denies %s", (_label, credentialVerifier) => {
    expect(
      new CapabilityIssuerTrustAuthority(credentialVerifier).evaluate(
        request()
      ).outcome
    ).toBe("DENIED");
  });

  it("denies revoked, unauthorized, and cross-tenant issuers", () => {
    const trust = new CapabilityIssuerTrustAuthority(verifier());
    expect(
      trust.evaluate(
        request({ issuer: issuer({ revocation_status: "REVOKED" }) })
      ).outcome
    ).toBe("DENIED");
    expect(
      trust.evaluate(
        request({
          issuer: issuer({ allowed_capabilities: ["CAPABILITY-OTHER"] }),
        })
      ).outcome
    ).toBe("DENIED");
    expect(
      trust.evaluate(
        request({
          identity: identity("TENANT-OTHER"),
          authority: authority("TENANT-OTHER"),
        })
      ).outcome
    ).toBe("DENIED");
  });
});
