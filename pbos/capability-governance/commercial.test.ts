import { describe, expect, it } from "vitest";
import {
  createCommercialEntitlementRequest,
  createEntitlementBundleDefinition,
  validateCommercialEntitlementRequest,
  validateEntitlementBundleDefinition,
} from ".";

const effectiveAt = "2026-07-29T00:00:00.000Z";

function bundle() {
  return createEntitlementBundleDefinition({
    schema_version: "1.0.0",
    bundle_id: "BUNDLE-INSTITUTION-001",
    name: "Institution Capability Bundle",
    owner: "PLAYBOOK-COMMERCIAL-GOVERNANCE",
    version: "1.0.0",
    product_tier: "INSTITUTION_LICENSE",
    capability_ids: ["CAPABILITY-SCHOLAR-RECORD"],
    policy_ids: ["POLICY-INSTITUTION-001"],
    evidence_ids: ["EVIDENCE-BUNDLE-APPROVAL-001"],
    status: "APPROVED",
    effective_at: effectiveAt,
    expires_at: null,
  });
}

describe("PBOS commercial capability activation governance", () => {
  it("validates an approved entitlement bundle deterministically", () => {
    const value = bundle();
    expect(validateEntitlementBundleDefinition(value)).toEqual({
      valid: true,
      errors: [],
    });
    expect(validateEntitlementBundleDefinition(value)).toEqual(
      validateEntitlementBundleDefinition(value)
    );
  });

  it("binds a commercial request to an exact bundle without activating it", () => {
    const governedBundle = bundle();
    const request = createCommercialEntitlementRequest({
      schema_version: "1.0.0",
      request_id: "COMMERCIAL-REQUEST-001",
      bundle_id: governedBundle.bundle_id,
      bundle_digest: governedBundle.bundle_digest,
      beneficiary_id: "ORGANIZATION-001",
      organization_id: "ORGANIZATION-001",
      tenant_id: null,
      agreement_id: "AGREEMENT-001",
      commercial_authority_id: "PLAYBOOK-COMMERCIAL-AUTHORITY",
      entitlement_issuer_id: "PBOS-ENTITLEMENT-AUTHORITY",
      evidence_ids: ["EVIDENCE-AGREEMENT-001"],
      requested_at: effectiveAt,
    });

    expect(
      validateCommercialEntitlementRequest(request, governedBundle)
    ).toEqual({ valid: true, errors: [] });
    expect(request).not.toHaveProperty("activation");
    expect(request).not.toHaveProperty("authorization");
  });

  it("rejects bundle substitution and self-issued access", () => {
    const governedBundle = bundle();
    const request = createCommercialEntitlementRequest({
      schema_version: "1.0.0",
      request_id: "COMMERCIAL-REQUEST-002",
      bundle_id: governedBundle.bundle_id,
      bundle_digest: "0".repeat(64),
      beneficiary_id: "ORGANIZATION-001",
      organization_id: "ORGANIZATION-001",
      tenant_id: null,
      agreement_id: "AGREEMENT-002",
      commercial_authority_id: "ORGANIZATION-001",
      entitlement_issuer_id: "ORGANIZATION-001",
      evidence_ids: [],
      requested_at: effectiveAt,
    });
    const result = validateCommercialEntitlementRequest(
      request,
      governedBundle
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "commercial request bundle identity does not match.",
        "beneficiary cannot grant or issue its own entitlement.",
        "commercial request requires agreement evidence.",
      ])
    );
  });
});
