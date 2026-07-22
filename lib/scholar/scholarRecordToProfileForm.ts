import type { ScholarRecord } from "./types";

export type CollegeGoalsProfileForm = {
  dreamSchool: string;
  dreamSchoolName: string;
  dreamSchoolId: string;
  collegeList: string[];
};

const OPTIONAL_COLLEGE_SLOTS = 9;

function normalizeCollegeName(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function scholarRecordToProfileForm(record: ScholarRecord): CollegeGoalsProfileForm {
  const dreamSchool =
    normalizeCollegeName(record.college?.dreamSchool) ||
    normalizeCollegeName(record.college?.dreamSchoolName) ||
    normalizeCollegeName(record.academics?.dreamSchool);

  const topSchools = Array.isArray(record.college?.topSchools)
    ? record.college.topSchools.map(normalizeCollegeName)
    : [];

  return {
    dreamSchool,
    dreamSchoolName: normalizeCollegeName(record.college?.dreamSchoolName) || dreamSchool,
    dreamSchoolId: normalizeCollegeName(record.college?.dreamSchoolId),
    collegeList: Array.from(
      { length: OPTIONAL_COLLEGE_SLOTS },
      (_, index) => topSchools[index] || ""
    ),
  };
}
