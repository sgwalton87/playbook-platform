import type { AcademicIntelligenceReport, ParsedCourse } from "./types";
import { classifyCourseSubject, mapSubjectToAG } from "./classifier";

function score(values: boolean[]) {
  if (!values.length) return 0;
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

export function buildAcademicIntelligence(courses: Partial<ParsedCourse>[] = []): AcademicIntelligenceReport {
  const normalized: ParsedCourse[] = courses.map((course, index) => {
    const subject = course.subject || classifyCourseSubject(course.name || "");
    const credits = Number(course.credits ?? 0);
    const passed = course.passed ?? true;

    return {
      id: course.id || `course-${index}`,
      name: course.name || "Unnamed Course",
      grade: course.grade,
      credits,
      term: course.term,
      year: course.year,
      subject,
      agCategory: course.agCategory || mapSubjectToAG(subject),
      passed,
    };
  });

  const totalCredits = normalized.reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const passedCredits = normalized.filter(course => course.passed).reduce((sum, course) => sum + Number(course.credits || 0), 0);

  const agProgress: Record<string, number> = {};
  for (const course of normalized) {
    const key = course.agCategory || "Unclassified";
    agProgress[key] = (agProgress[key] || 0) + Number(course.credits || 0);
  }

  const hasEnglish = normalized.some(c => c.subject === "english");
  const hasMath = normalized.some(c => c.subject === "math");
  const hasScience = normalized.some(c => c.subject === "science");
  const hasHistory = normalized.some(c => c.subject === "history");
  const hasLanguage = normalized.some(c => c.subject === "language");
  const hasArts = normalized.some(c => c.subject === "arts");

  const collegeReadiness = score([hasEnglish, hasMath, hasScience, hasHistory, hasLanguage, hasArts]);
  const graduationProgress = Math.min(100, Math.round((passedCredits / 220) * 100));

  const missingSignals = [
    !hasEnglish && "English coursework missing",
    !hasMath && "Math coursework missing",
    !hasScience && "Science coursework missing",
    !hasHistory && "History/Social Science coursework missing",
    !hasLanguage && "Language other than English missing",
    !hasArts && "Visual/Performing Arts missing",
  ].filter(Boolean) as string[];

  return {
    courses: normalized,
    totalCredits,
    passedCredits,
    agProgress,
    graduationProgress,
    collegeReadiness,
    missingSignals,
  };
}
