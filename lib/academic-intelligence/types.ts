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

export interface ParsedCourse {
  id: string;
  name: string;
  grade?: string | number;
  credits?: number;
  term?: string;
  year?: string | number;
  subject: CourseSubject;
  agCategory?: string;
  passed?: boolean;
}

export interface AcademicIntelligenceReport {
  courses: ParsedCourse[];
  totalCredits: number;
  passedCredits: number;
  agProgress: Record<string, number>;
  graduationProgress: number;
  collegeReadiness: number;
  missingSignals: string[];
}
