import type { AcademicCourse } from "../types";

export function buildAcademicRecommendations({
  agMissing,
  creditsRemaining,
  courses,
}: {
  agMissing: string[];
  creditsRemaining: number;
  courses: AcademicCourse[];
}) {
  const recommendations: string[] = [];
  const nextActions: string[] = [];

  if (courses.length === 0) {
    recommendations.push("Upload or enter transcript courses to activate Academic Intelligence.");
    nextActions.push("Add transcript courses.");
  }

  if (agMissing.length > 0) {
    recommendations.push("Prioritize missing A-G categories before senior year.");
    nextActions.push("Review next semester course plan.");
  }

  if (creditsRemaining > 0) {
    recommendations.push("Track graduation credits each term.");
    nextActions.push("Confirm credits with counselor or academic advisor.");
  }

  if (!recommendations.length) {
    recommendations.push("Academic signals look strong. Continue adding evidence and verified milestones.");
    nextActions.push("Add honors, AP, dual enrollment, or college readiness evidence.");
  }

  return { recommendations, nextActions };
}
