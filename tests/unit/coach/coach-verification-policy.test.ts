import { describe, expect, it } from "vitest";
import {
  buildCoachVerificationEvidence,
  coachAuthorityReady,
} from "@/lib/coach-verification/policy";

describe("Coach verification policy", () => {
  it("builds verification evidence from the Coach onboarding contract", () => {
    expect(buildCoachVerificationEvidence({
      school: "Oakland High School",
      school_city: "Oakland",
      school_state: "California",
      official_school_email: "coach@school.org",
      primary_sport: "Basketball",
      coach_role: "Head Coach",
      years_coaching: "8–15 years",
      roster_size: "11–20",
      coach_support_focus: ["Academic eligibility", "Recruiting exposure"],
    })).toMatchObject({
      school: "Oakland High School",
      officialSchoolEmail: "coach@school.org",
      primarySport: "Basketball",
      coachRole: "Head Coach",
      supportFocus: ["Academic eligibility", "Recruiting exposure"],
    });
  });

  it("fails closed when required Coach identity evidence is missing", () => {
    expect(() => buildCoachVerificationEvidence({
      school: "Oakland High School",
      primary_sport: "Basketball",
      coach_role: "Head Coach",
    })).toThrow("official school email");
  });

  it("requires both approved identity evidence and an active Coach relationship", () => {
    expect(coachAuthorityReady({ verificationStatus: "pending", hasActiveCoachRelationship: true })).toBe(false);
    expect(coachAuthorityReady({ verificationStatus: "approved", hasActiveCoachRelationship: false })).toBe(false);
    expect(coachAuthorityReady({ verificationStatus: "approved", hasActiveCoachRelationship: true })).toBe(true);
  });
});
