import { describe, expect, it } from "vitest";
import {
  buildEducatorVerificationEvidence,
  educatorAuthorityReady,
} from "@/lib/educator-verification/policy";

describe("Educator verification policy", () => {
  it("builds evidence from the Educator onboarding contract", () => {
    expect(buildEducatorVerificationEvidence({
      school: "Oakland School for the Arts",
      school_district: "Oakland Unified",
      official_edu_email: "teacher@school.org",
      subjects_taught: ["English", "College/Career"],
      educator_support_focus: ["College applications", "Letters of recommendation"],
    })).toMatchObject({
      school: "Oakland School for the Arts",
      schoolDistrict: "Oakland Unified",
      officialEduEmail: "teacher@school.org",
      subjectsTaught: ["English", "College/Career"],
    });
  });

  it("fails closed without school identity evidence", () => {
    expect(() => buildEducatorVerificationEvidence({ school: "OSA" })).toThrow("official school email");
  });

  it("requires identity approval plus an active Educator relationship", () => {
    expect(educatorAuthorityReady({ verificationStatus: "pending", hasActiveEducatorRelationship: true })).toBe(false);
    expect(educatorAuthorityReady({ verificationStatus: "approved", hasActiveEducatorRelationship: false })).toBe(false);
    expect(educatorAuthorityReady({ verificationStatus: "approved", hasActiveEducatorRelationship: true })).toBe(true);
  });
});
