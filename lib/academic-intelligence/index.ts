export * from "./types";
export * from "./academicIntelligenceEngine";
export * from "./transcript/transcriptIntelligence";
export * from "./gpa/gpaIntelligence";
export * from "./ag/agIntelligence";
export * from "./graduation/graduationIntelligence";
export * from "./readiness/readinessIntelligence";
export * from "./recommendations/recommendationIntelligence";

import { buildAcademicIntelligenceReport } from "./academicIntelligenceEngine";

export function classifyCourseSubject(courseName: string) {
  const name = courseName.toLowerCase();

  if (name.includes("english") || name.includes("literature") || name.includes("writing")) return "english";
  if (name.includes("algebra") || name.includes("geometry") || name.includes("calculus") || name.includes("math")) return "math";
  if (name.includes("biology") || name.includes("chemistry") || name.includes("physics") || name.includes("science")) return "science";
  if (name.includes("history") || name.includes("government") || name.includes("civics") || name.includes("economics")) return "history";
  if (name.includes("spanish") || name.includes("french") || name.includes("mandarin") || name.includes("language")) return "language";
  if (name.includes("art") || name.includes("music") || name.includes("theater") || name.includes("dance")) return "arts";
  if (name.includes("college") || name.includes("seminar") || name.includes("prep")) return "college_prep";

  return "unknown";
}

function subjectToAG(subject: string) {
  if (subject === "history") return "A";
  if (subject === "english") return "B";
  if (subject === "math") return "C";
  if (subject === "science") return "D";
  if (subject === "language") return "E";
  if (subject === "arts") return "F";
  if (subject === "college_prep") return "G";
  return undefined;
}

export function buildAcademicIntelligence(courses: any[] = []) {
  const normalized = courses.map((course, index) => {
    const subject = course.subject || classifyCourseSubject(course.name || "");

    return {
      id: course.id || `course-${index}`,
      name: course.name || "Unnamed Course",
      subject,
      credits: Number(course.credits || 0),
      grade: course.grade,
      completed: course.completed ?? course.passed ?? true,
      agCategory: course.agCategory || subjectToAG(subject),
    };
  });

  const report = buildAcademicIntelligenceReport(normalized);

  return {
    ...report,
    courses: normalized,
    totalCredits: normalized.reduce((sum, course) => sum + Number(course.credits || 0), 0),
    passedCredits: report.creditsEarned,
    missingSignals: report.gaps,
  };
}

export * from "./transcript";
