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
