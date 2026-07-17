import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildScholarRecord,
  scholarRecordToProfileForm,
} from "@/lib/scholar-record";

describe("scholarRecordToProfileForm", () => {
  it("maps the canonical record into Profile editor fields", () => {
    const record = buildScholarRecord({
      profile: {
        id: "scholar-1",
        full_name: "Jordan Scholar",
        avatar_url: "/avatar.jpg",

        onboarding_data: {
          school: "Oakland High School",
          school_district: "Oakland Unified",
          city: "Oakland",
          zip_code: "94601",
          graduation_year: "2027",
          weighted_gpa: "3.8",
          unweighted_gpa: "3.6",
          ela_score: "Standard Met",
          math_score: "Standard Exceeded",
          dream_school: "Howard University",
          top_schools: [
            "Howard University",
            "UCLA",
            "UC Berkeley",
          ],
          pillars: [
            "academic",
            "financial",
          ],
          activities: [
            {
              name: "Basketball",
              role: "Captain",
            },
          ],
        },
      },

      agProgress: [
        {
          subject: "a",
          years_completed: 2,
        },
      ],
    });

    const form =
      scholarRecordToProfileForm(record);

    expect(form.fullName).toBe(
      "Jordan Scholar"
    );

    expect(form.school).toBe(
      "Oakland High School"
    );

    expect(form.district).toBe(
      "Oakland Unified"
    );

    expect(form.city).toBe("Oakland");
    expect(form.zipCode).toBe("94601");

    expect(form.graduationYear).toBe("2027");

    expect(form.dreamSchool).toBe(
      "Howard University"
    );

    expect(form.collegeList).toEqual([
      "UCLA",
      "UC Berkeley",
    ]);

    expect(form.pillars).toEqual([
      "Academic Success",
      "Financial Literacy",
    ]);

    expect(form.activities).toHaveLength(1);

    expect(form.transcriptUploaded).toBe(
      true
    );
  });

  it("returns safe controlled-input defaults", () => {
    const record = buildScholarRecord({
      profile: {
        id: "scholar-2",
      },
    });

    const form =
      scholarRecordToProfileForm(record);

    expect(form.school).toBe("");
    expect(form.graduationYear).toBe("");
    expect(form.collegeList).toEqual([]);
    expect(form.pillars).toEqual([]);
    expect(form.activities).toEqual([]);
    expect(form.transcriptUploaded).toBe(false);
  });

  it("does not duplicate the dream school in the additional list", () => {
    const record = buildScholarRecord({
      profile: {
        id: "scholar-3",

        onboarding_data: {
          dream_school: "Howard University",
          top_schools: [
            "Howard University",
            "Hampton University",
          ],
        },
      },
    });

    const form =
      scholarRecordToProfileForm(record);

    expect(form.dreamSchool).toBe(
      "Howard University"
    );

    expect(form.collegeList).toEqual([
      "Hampton University",
    ]);
  });
});
