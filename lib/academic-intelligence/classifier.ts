import type { CourseSubject } from "./types";

export function classifyCourseSubject(courseName: string): CourseSubject {
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

export function mapSubjectToAG(subject: CourseSubject): string {
  const map: Record<CourseSubject, string> = {
    history: "A - History/Social Science",
    english: "B - English",
    math: "C - Mathematics",
    science: "D - Laboratory Science",
    language: "E - Language Other Than English",
    arts: "F - Visual/Performing Arts",
    college_prep: "G - College Preparatory Elective",
    elective: "G - College Preparatory Elective",
    unknown: "Unclassified",
  };

  return map[subject];
}
