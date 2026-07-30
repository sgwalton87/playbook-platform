import { describe, expect, it } from "vitest";
import { KernelProductionProofAuthority } from "./authority";
import { kernelProductionProofIssuanceRequestDigest } from "./identity";
import type { KernelProductionProofIssuanceRequest } from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-31T12:00:00.000Z";

function request(
  overrides: Partial<KernelProductionProofIssuanceRequest> = {}
): KernelProductionProofIssuanceRequest {
  const body: KernelProductionProofIssuanceRequest = {
    request_id: "REQUEST-001",
    provider_identity: "PROVIDER-001",
    certification_identity: "CERTIFICATION-001",
    certification_status: "CERTIFIED",
    certification_digest: "a".repeat(64),
    evidence_references: ["EVIDENCE-001"],
    evidence_valid: true,
    review_references: ["REVIEW-001"],
    review_approved: true,
    authority: "PBOS-PRODUCTION-PROOF-AUTHORITY",
    requested_at: now,
    expiration: later,
    digest: "",
    ...overrides,
  };
  return { ...body, digest: kernelProductionProofIssuanceRequestDigest(body) };
}

function authority(): KernelProductionProofAuthority {
  return new KernelProductionProofAuthority(
    new Set(["PBOS-PRODUCTION-PROOF-AUTHORITY"])
  );
}

describe("Kernel production proof authority", () => {
  it("issues proof only for a completely trusted input", () => {
    expect(authority().issue(request())).toMatchObject({
      provider_identity: "PROVIDER-001",
      authority: "PBOS-KERNEL-PRODUCTION-PROOF",
    });
  });

  it("rejects missing certification, invalid evidence, expired trust, unauthorized authority, and tampering", () => {
    expect(() =>
      authority().issue(request({ certification_status: "BLOCKED" }))
    ).toThrow("issuance rejected");
    expect(() =>
      authority().issue(request({ evidence_valid: false }))
    ).toThrow("issuance rejected");
    expect(() => authority().issue(request({ expiration: now }))).toThrow(
      "issuance rejected"
    );
    expect(() =>
      authority().issue(request({ authority: "UNKNOWN" }))
    ).toThrow("issuance rejected");
    expect(() =>
      authority().issue({
        ...request(),
        evidence_references: ["TAMPERED"],
      })
    ).toThrow("issuance rejected");
  });
});
