import type { AcademicCourse } from "../types";

const gradePoints: Record<string, number> = {
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  D: 1,
  F: 0,
};

export function calculateGPA(courses: AcademicCourse[]) {
  const graded = courses.filter(course => course.completed && course.grade && gradePoints[course.grade] !== undefined);

  if (!graded.length) return 0;

  const totalPoints = graded.reduce((sum, course) => sum + gradePoints[course.grade || "F"], 0);

  return Number((totalPoints / graded.length).toFixed(2));
}
