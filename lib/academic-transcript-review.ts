import type { AgParseResult, AgSubjectResult } from "@/lib/academic-transcript-fallback";

export const AG_SUBJECTS = [
  { key: "A", name: "History / Social Science", required: 2 },
  { key: "B", name: "English", required: 4 },
  { key: "C", name: "Mathematics", required: 3 },
  { key: "D", name: "Laboratory Science", required: 2 },
  { key: "E", name: "Language Other Than English", required: 2 },
  { key: "F", name: "Visual & Performing Arts", required: 1 },
  { key: "G", name: "College-Preparatory Elective", required: 1 },
] as const;

export type AgCategory = (typeof AG_SUBJECTS)[number]["key"];
export type ReviewedAgParseResult = Record<AgCategory, AgSubjectResult>;

function finiteNumber(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function normalizeTranscriptDraft(input: Partial<AgParseResult> | Record<string, unknown>): ReviewedAgParseResult {
  const output = {} as ReviewedAgParseResult;
  for (const subject of AG_SUBJECTS) {
    const value = (input as Partial<Record<AgCategory, Partial<AgSubjectResult>>>)[subject.key] ?? {};
    const courses = Array.isArray(value.courses_taken)
      ? [...new Set(value.courses_taken.map(course => String(course).trim()).filter(Boolean))]
      : [];
    output[subject.key] = {
      years_required: subject.required,
      years_completed: finiteNumber(value.years_completed, 0),
      in_progress: Boolean(value.in_progress),
      courses_taken: courses,
      current_course: value.current_course ? String(value.current_course).trim() || null : null,
    };
  }
  return output;
}

export function reviewedDraftToAcademicCourses(draft: ReviewedAgParseResult) {
  return AG_SUBJECTS.flatMap(subject => {
    const value = draft[subject.key];
    const completed = value.courses_taken.map(course => ({
      name: course,
      subject: subject.name,
      credits: 10,
      agCategory: subject.key,
      completed: true,
    }));
    const current = value.current_course
      ? [{ name: value.current_course, subject: subject.name, credits: 0, agCategory: subject.key, completed: false }]
      : [];
    return [...completed, ...current];
  });
}
