import type { AcademicCourse } from "../types";

export function analyzeGraduationProgress(courses: AcademicCourse[]) {
  const creditsEarned = courses
    .filter(course => course.completed)
    .reduce((sum, course) => sum + Number(course.credits || 0), 0);

  const requiredCredits = 220;
  const graduationProgress = Math.min(100, Math.round((creditsEarned / requiredCredits) * 100));

  return {
    creditsEarned,
    requiredCredits,
    creditsRemaining: Math.max(0, requiredCredits - creditsEarned),
    graduationProgress,
    gaps: creditsEarned < requiredCredits ? [`${requiredCredits - creditsEarned} credits remaining for graduation benchmark.`] : [],
  };
}
