import { describe, expect, it } from "vitest";
import { buildEmployerVerificationEvidence, employerAuthorityReady } from "@/lib/employer-verification/policy";

describe("Employer verification policy", () => {
  it("builds evidence from Employer onboarding", () => {
    expect(buildEmployerVerificationEvidence({ organization_name: "Example Corp", official_email: "partner@example.com", opportunity_types: ["Internships"] })).toMatchObject({ organizationName: "Example Corp", officialEmail: "partner@example.com", opportunityTypes: ["Internships"] });
  });
  it("fails closed without organization identity evidence", () => {
    expect(() => buildEmployerVerificationEvidence({ organization_name: "Example Corp" })).toThrow("official work email");
  });
  it("requires approved identity and approved opportunity scope", () => {
    expect(employerAuthorityReady({ verificationStatus: "pending", hasApprovedOpportunityScope: true })).toBe(false);
    expect(employerAuthorityReady({ verificationStatus: "approved", hasApprovedOpportunityScope: false })).toBe(false);
    expect(employerAuthorityReady({ verificationStatus: "approved", hasApprovedOpportunityScope: true })).toBe(true);
  });
});
