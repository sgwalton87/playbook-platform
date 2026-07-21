import type { IntelligenceReport } from "@/lib/intelligence";

export type CourseSubject =
  | "english"
  | "math"
  | "science"
  | "history"
  | "language"
  | "arts"
  | "college_prep"
  | "elective"
  | "unknown";

export type AGCategory = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface AcademicCourse {
  id?: string;
  name: string;
  subject: string;
  gradeLevel?: number;
  credits: number;
  grade?: string;
  term?: string;
  agCategory?: AGCategory;
  completed: boolean;
}

export interface AcademicReport extends IntelligenceReport {
  gpa: number;
  creditsEarned: number;
  graduationProgress: number;
  agProgress: number;
  collegeReadiness: number;
}


/**
 * Backward-compatible types for Academic Intelligence v1.
 * Older engines/tests still import these names.
 */
export type ParsedCourse = AcademicCourse;

export interface AcademicIntelligenceReport {
  courses: ParsedCourse[];
  totalCredits: number;
  passedCredits: number;
  agProgress: Record<string, number> | number;
  graduationProgress: number;
  collegeReadiness: number;
  missingSignals: string[];
}
