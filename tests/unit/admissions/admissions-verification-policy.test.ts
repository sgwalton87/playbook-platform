import { describe, expect, it } from "vitest";
import { buildAdmissionsVerificationEvidence, admissionsAuthorityReady } from "@/lib/admissions-verification/policy";

describe("Admissions verification policy", () => {
  it("builds evidence from Admissions onboarding", () => {
    expect(buildAdmissionsVerificationEvidence({
      college_name: "Example University", department: "Undergraduate Admissions", official_edu_email: "admissions@example.edu",
      admissions_region: "Northern California", target_majors: ["STEM"], student_populations: ["First-generation students"],
    })).toMatchObject({ collegeName: "Example University", department: "Undergraduate Admissions", officialEduEmail: "admissions@example.edu" });
  });
  it("fails closed without institution identity evidence", () => {
    expect(() => buildAdmissionsVerificationEvidence({ college_name: "Example University" })).toThrow("department");
  });
  it("requires approved identity and approved admissions scope", () => {
    expect(admissionsAuthorityReady({ verificationStatus: "pending", hasApprovedAdmissionsScope: true })).toBe(false);
    expect(admissionsAuthorityReady({ verificationStatus: "approved", hasApprovedAdmissionsScope: false })).toBe(false);
    expect(admissionsAuthorityReady({ verificationStatus: "approved", hasApprovedAdmissionsScope: true })).toBe(true);
  });
});
