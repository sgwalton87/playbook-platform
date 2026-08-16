import { describe, expect, it } from "vitest";
import { buildInstitutionalVerificationEvidence } from "@/lib/onboarding";

describe("institutional verification evidence", () => {
  it("builds Educator evidence from Educator-only onboarding fields", () => {
    const result = buildInstitutionalVerificationEvidence("educator", {
      school: "Oakland School for the Arts",
      school_district: "Oakland Unified",
      official_edu_email: "teacher@school.org",
      subjects_taught: ["English", "Arts/media"],
      educator_support_focus: ["College applications"],
      open_to_letters: "Yes",
      official_school_email: "must-not-be-used@coach.org",
    });

    expect(result).toMatchObject({
      role: "educator",
      officialEmail: "teacher@school.org",
      organizationName: "Oakland School for the Arts",
    });
    expect(result.evidence).toMatchObject({
      schoolDistrict: "Oakland Unified",
      subjectsTaught: ["English", "Arts/media"],
      supportFocus: ["College applications"],
      openToLetters: "Yes",
    });
    expect(result.officialEmail).not.toBe("must-not-be-used@coach.org");
  });

  it("builds Counselor evidence from Counselor-only onboarding fields", () => {
    const result = buildInstitutionalVerificationEvidence("high-school-counselor", {
      school: "McClymonds High School",
      school_district: "Oakland Unified",
      official_email: "counselor@school.org",
      counselor_scope: ["Academic planning", "Financial aid"],
      official_edu_email: "must-not-be-used@educator.org",
    });

    expect(result).toEqual({
      role: "high-school-counselor",
      officialEmail: "counselor@school.org",
      organizationName: "McClymonds High School",
      evidence: {
        school: "McClymonds High School",
        schoolDistrict: "Oakland Unified",
        counselorScope: ["Academic planning", "Financial aid"],
      },
    });
  });

  it("builds Coach evidence from Coach-only onboarding fields", () => {
    const result = buildInstitutionalVerificationEvidence("coach", {
      school: "Oakland Tech",
      school_city: "Oakland",
      school_state: "California",
      official_school_email: "coach@school.org",
      primary_sport: "Basketball",
      coach_role: "Head Coach",
      years_coaching: "8–15 years",
      roster_size: "11–20",
      coach_support_focus: ["Academic eligibility", "Recruiting exposure"],
    });

    expect(result).toMatchObject({
      role: "coach",
      officialEmail: "coach@school.org",
      organizationName: "Oakland Tech",
    });
    expect(result.evidence).toMatchObject({
      schoolCity: "Oakland",
      schoolState: "California",
      primarySport: "Basketball",
      coachRole: "Head Coach",
      rosterSize: "11–20",
    });
  });

  it("fails closed when the role-specific institution or official email is missing", () => {
    expect(() => buildInstitutionalVerificationEvidence("educator", {
      school: "School",
      official_school_email: "wrong-field@school.org",
    })).toThrow("Educator verification requires");

    expect(() => buildInstitutionalVerificationEvidence("high-school-counselor", {
      school: "School",
      official_edu_email: "wrong-field@school.org",
    })).toThrow("Counselor verification requires");

    expect(() => buildInstitutionalVerificationEvidence("coach", {
      school: "School",
      official_edu_email: "wrong-field@school.org",
    })).toThrow("Coach verification requires");
  });
});
