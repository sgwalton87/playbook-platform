import { describe, expect, it } from "vitest";
import {
  buildRecruitingVerificationEvidence,
  recruitingAuthorityReady,
} from "@/lib/recruiting-verification/policy";

describe("Recruiting verification policy", () => {
  it("builds evidence from the Recruiting onboarding contract", () => {
    expect(buildRecruitingVerificationEvidence({
      college_name: "Example University",
      official_edu_email: "coach@example.edu",
      primary_sport_recruiting: "Basketball",
      recruiting_radius: ["National"],
      graduation_classes_recruiting: ["2027", "2028"],
    })).toMatchObject({
      collegeName: "Example University",
      officialEduEmail: "coach@example.edu",
      primarySportRecruiting: "Basketball",
      recruitingRadius: ["National"],
    });
  });

  it("fails closed without institutional recruiting evidence", () => {
    expect(() => buildRecruitingVerificationEvidence({ college_name: "Example University" })).toThrow("official institutional email");
  });

  it("requires approved identity and approved recruiting scope", () => {
    expect(recruitingAuthorityReady({ verificationStatus: "pending", hasApprovedRecruitingScope: true })).toBe(false);
    expect(recruitingAuthorityReady({ verificationStatus: "approved", hasApprovedRecruitingScope: false })).toBe(false);
    expect(recruitingAuthorityReady({ verificationStatus: "approved", hasApprovedRecruitingScope: true })).toBe(true);
  });
});
