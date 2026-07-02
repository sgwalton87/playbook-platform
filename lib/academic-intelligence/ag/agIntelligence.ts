import type { AcademicCourse, AGCategory } from "../types";

const requiredCategories: AGCategory[] = ["A", "B", "C", "D", "E", "F", "G"];

export function analyzeAGProgress(courses: AcademicCourse[]) {
  const completedCategories = new Set(
    courses
      .filter(course => course.completed && course.agCategory)
      .map(course => course.agCategory)
  );

  const completed = requiredCategories.filter(category => completedCategories.has(category));
  const missing = requiredCategories.filter(category => !completedCategories.has(category));

  const agProgress = Math.round((completed.length / requiredCategories.length) * 100);

  return {
    agProgress,
    completed,
    missing,
    gaps: missing.map(category => `A-G category ${category} needs coursework evidence.`),
  };
}
