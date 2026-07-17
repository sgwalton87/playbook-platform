import type {
  AcademicPathInput,
  AcademicValidationResult,
} from "../types";
import { isRecognizedGpa } from "../providers/gpa";

function hasValue(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim().length > 0
  );
}

export function validateAcademicPath(
  input: AcademicPathInput
): AcademicValidationResult {
  const errors: Record<string, string> = {};

  if (!hasValue(input.school)) {
    errors.school =
      "Current high school or institution is required.";
  }

  if (!hasValue(input.school_district)) {
    errors.school_district =
      "California school district is required.";
  }

  if (!hasValue(input.grade)) {
    errors.grade = "Grade is required.";
  }

  if (!hasValue(input.gpa)) {
    errors.gpa = "Current GPA is required.";
  } else if (!isRecognizedGpa(input.gpa)) {
    errors.gpa =
      "Choose a GPA between 0.00 and 5.00.";
  }

  if (!hasValue(input.graduation_year)) {
    errors.graduation_year =
      "Graduation year is required.";
  }

  if (!hasValue(input.dream_school)) {
    errors.dream_school = "Dream school is required.";
  }

  const topSchools = Array.isArray(input.top_schools)
    ? input.top_schools.filter((school) =>
        hasValue(school)
      )
    : [];

  if (topSchools.length === 0) {
    errors.top_schools =
      "Add at least one school to your college list.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
