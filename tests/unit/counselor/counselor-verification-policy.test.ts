import { describe, expect, it } from "vitest";
import {
  buildCounselorVerificationEvidence,
  counselorAuthorityReady,
} from "@/lib/counselor-verification/policy";

describe("Counselor verification policy", () => {
  it("builds evidence from the Counselor onboarding contract", () => {
    expect(buildCounselorVerificationEvidence({
      school: "Oakland School for the Arts",
      school_district: "Oakland Unified",
      official_email: "counselor@school.org",
      counselor_scope: ["Academic planning", "College applications"],
    })).toMatchObject({
      school: "Oakland School for the Arts",
      schoolDistrict: "Oakland Unified",
      officialEmail: "counselor@school.org",
      counselorScope: ["Academic planning", "College applications"],
    });
  });

  it("fails closed without school identity evidence", () => {
    expect(() => buildCounselorVerificationEvidence({ school: "OSA" })).toThrow("official school email");
  });

  it("requires approved identity plus an active Counselor relationship", () => {
    expect(counselorAuthorityReady({ verificationStatus: "pending", hasActiveCounselorRelationship: true })).toBe(false);
    expect(counselorAuthorityReady({ verificationStatus: "approved", hasActiveCounselorRelationship: false })).toBe(false);
    expect(counselorAuthorityReady({ verificationStatus: "approved", hasActiveCounselorRelationship: true })).toBe(true);
  });
});
