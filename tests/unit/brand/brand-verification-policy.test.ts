import { describe, expect, it } from "vitest";
import { buildBrandVerificationEvidence, brandAuthorityReady } from "@/lib/brand-verification/policy";

describe("Brand Partner verification policy", () => {
  it("builds evidence from Brand Partner onboarding", () => {
    expect(buildBrandVerificationEvidence({ organization_name: "Example Brand", nil_acknowledgement: "I understand athlete campaigns may require compliance review", campaign_types: ["Scholarships"] })).toMatchObject({ organizationName: "Example Brand", campaignTypes: ["Scholarships"] });
  });
  it("fails closed without compliance acknowledgement", () => {
    expect(() => buildBrandVerificationEvidence({ organization_name: "Example Brand" })).toThrow("NIL/compliance acknowledgement");
  });
  it("requires identity, campaign scope, and compliance scope", () => {
    expect(brandAuthorityReady({ verificationStatus: "approved", hasApprovedCampaignScope: true, hasApprovedComplianceScope: false })).toBe(false);
    expect(brandAuthorityReady({ verificationStatus: "approved", hasApprovedCampaignScope: false, hasApprovedComplianceScope: true })).toBe(false);
    expect(brandAuthorityReady({ verificationStatus: "approved", hasApprovedCampaignScope: true, hasApprovedComplianceScope: true })).toBe(true);
  });
});
