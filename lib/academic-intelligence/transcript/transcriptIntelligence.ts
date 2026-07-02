import type { AcademicCourse } from "../types";

export function analyzeTranscript(courses: AcademicCourse[]) {
  const completed = courses.filter(course => course.completed);
  const failed = courses.filter(course => !course.completed);
  const creditsEarned = completed.reduce((sum, course) => sum + Number(course.credits || 0), 0);

  return {
    totalCourses: courses.length,
    completedCourses: completed.length,
    failedCourses: failed.length,
    creditsEarned,
    transcriptComplete: courses.length > 0,
    gaps: [
      courses.length === 0 && "No transcript courses added yet.",
      failed.length > 0 && `${failed.length} course(s) may need review or recovery.`,
    ].filter(Boolean) as string[],
  };
}
