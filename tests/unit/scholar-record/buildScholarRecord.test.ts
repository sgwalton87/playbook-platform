import { describe, expect, it } from "vitest";

import { buildPlaybookRecord } from "@/lib/playbook";

describe("buildPlaybookRecord", () => {
  it("merges database columns and onboarding data", () => {
    const record = buildPlaybookRecord({
      authEmail: "scholar@example.com",

      profile: {
        id: "scholar-1",
        role: "scholar",
        full_name: "Jordan Scholar",
        avatar_url: "/avatar.jpg",

        onboarding_data: {
          school: "Oakland High School",
          school_district: "Oakland Unified",
          city: "Oakland",
          zip_code: "94601",
          graduation_year: "2027",
          dream_school: "Howard University",
          top_schools: [
            "Howard University",
            "UC Berkeley",
            "UCLA",
          ],
          pillars: [
            "academic",
            "financial",
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

    expect(record.identity.email).toBe(
      "scholar@example.com"
    );

    expect(record.identity.fullName).toBe(
      "Jordan Scholar"
    );

    expect(record.identity.city).toBe("Oakland");
    expect(record.identity.zipCode).toBe("94601");

    expect(record.academic.school).toBe(
      "Oakland High School"
    );

    expect(record.academic.schoolDistrict).toBe(
      "Oakland Unified"
    );

    expect(record.academic.graduationYear).toBe(
      "2027"
    );

    expect(record.college.dreamSchool).toBe(
      "Howard University"
    );

    expect(record.college.topSchools).toEqual([
      "Howard University",
      "UC Berkeley",
      "UCLA",
    ]);

    expect(record.community.pillars).toEqual([
      "Academic Success",
      "Financial Literacy",
    ]);

    expect(record.transcript.uploaded).toBe(true);
    expect(record.transcript.agProgress).toHaveLength(1);
  });

  it("supports legacy profile column names", () => {
    const record = buildPlaybookRecord({
      profile: {
        id: "scholar-2",
        grad_year: 2028,
        district: "Vallejo City Unified",
        college_list:
          "Howard University, Hampton University",
      },
    });

    expect(record.academic.graduationYear).toBe(2028);

    expect(record.academic.schoolDistrict).toBe(
      "Vallejo City Unified"
    );

    expect(record.college.topSchools).toEqual([
      "Howard University",
      "Hampton University",
    ]);
  });

  it("prefers direct profile columns over onboarding fallbacks", () => {
    const record = buildPlaybookRecord({
      profile: {
        id: "scholar-3",
        school: "Current School",

        onboarding_data: {
          school: "Previous School",
        },
      },
    });

    expect(record.academic.school).toBe(
      "Current School"
    );
  });

  it("returns safe defaults for missing data", () => {
    const record = buildPlaybookRecord({
      profile: {
        id: "scholar-4",
      },
    });

    expect(record.college.topSchools).toEqual([]);
    expect(record.community.pillars).toEqual([]);
    expect(record.transcript.courses).toEqual([]);
    expect(record.transcript.agProgress).toEqual([]);
    expect(record.transcript.uploaded).toBe(false);
  });
});
