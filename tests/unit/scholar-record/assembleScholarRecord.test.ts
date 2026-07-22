import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  assemblePlaybookRecord,
} from "@/lib/playbook";

describe("assemblePlaybookRecord", () => {
  it("loads all scholar data into one record", async () => {
    const loadProfile = vi.fn().mockResolvedValue({
      id: "scholar-1",
      full_name: "Jordan Scholar",
      onboarding_data: {
        school: "Oakland High School",
        graduation_year: "2027",
        top_schools: [
          "Howard University",
          "UCLA",
        ],
      },
    });

    const loadAgProgress =
      vi.fn().mockResolvedValue([
        {
          subject: "a",
          years_completed: 2,
        },
      ]);

    const loadTranscriptCourses =
      vi.fn().mockResolvedValue([
        {
          course_name: "English 10",
          grade: "A",
        },
      ]);

    const record =
      await assemblePlaybookRecord({
        userId: "scholar-1",
        authEmail: "scholar@example.com",
        dependencies: {
          loadProfile,
          loadAgProgress,
          loadTranscriptCourses,
        },
      });

    expect(loadProfile).toHaveBeenCalledWith(
      "scholar-1"
    );

    expect(loadAgProgress).toHaveBeenCalledWith(
      "scholar-1"
    );

    expect(
      loadTranscriptCourses
    ).toHaveBeenCalledWith("scholar-1");

    expect(record?.identity.fullName).toBe(
      "Jordan Scholar"
    );

    expect(record?.academic.school).toBe(
      "Oakland High School"
    );

    expect(record?.college.topSchools).toEqual([
      "Howard University",
      "UCLA",
    ]);

    expect(record?.transcript.agProgress).toHaveLength(
      1
    );

    expect(record?.transcript.courses).toHaveLength(
      1
    );

    expect(record?.transcript.uploaded).toBe(true);
  });

  it("can skip academic queries for lightweight screens", async () => {
    const loadAgProgress = vi.fn();
    const loadTranscriptCourses = vi.fn();

    const record =
      await assemblePlaybookRecord({
        userId: "scholar-2",
        includeAcademicData: false,
        dependencies: {
          loadProfile: async () => ({
            id: "scholar-2",
            full_name: "Taylor Scholar",
          }),
          loadAgProgress,
          loadTranscriptCourses,
        },
      });

    expect(record?.identity.fullName).toBe(
      "Taylor Scholar"
    );

    expect(loadAgProgress).not.toHaveBeenCalled();
    expect(
      loadTranscriptCourses
    ).not.toHaveBeenCalled();

    expect(record?.transcript.agProgress).toEqual([]);
    expect(record?.transcript.courses).toEqual([]);
  });

  it("returns null when no profile exists", async () => {
    const record =
      await assemblePlaybookRecord({
        userId: "missing-user",
        dependencies: {
          loadProfile: async () => null,
        },
      });

    expect(record).toBeNull();
  });
});
