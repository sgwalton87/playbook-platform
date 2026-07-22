export type AcademicAssessment = { total?: string | null; composite?: string | null; evidence: any[] };

export interface CanonicalAgProgress {
  subject: string;
  name: string;
  yearsCompleted: number;
  yearsRequired: number;
  inProgress: boolean;
  coursesTaken: string[];
  currentCourse: string | null;
  met: boolean;
  updatedAt: string | null;
}

export interface CanonicalCourse {
  id: string;
  name: string | null;
  subject: string | null;
  grade: string | null;
  credits: number;
  term: string | null;
  schoolYear: string | null;
  level: string | null;
  status: string | null;
}

export interface ScholarRecordInput {
  profile?: any;
  rawProfile?: any;
  certificates?: any[];
  badges?: any[];
  activities?: any[];
  posts?: any[];
  agProgress?: any[];
  ag_progress?: any[];
  courses?: any[];
  courseHistory?: any[];
  currentCourses?: any[];
  semesterHistory?: any[];
  transcriptMetadata?: { source?: string; importedAt?: string | null; verified?: boolean };
  academicSummary?: { creditsEarned?: number };
  ap?: any[];
  ib?: any[];
  dualEnrollment?: any[];
  academicHonors?: any[];
}

export interface ScholarRecord {
  id: string;
  rawProfile: any;
  identity: {
    username?: string;
    role?: string;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    school?: string | null;
    grade?: string | null;
    graduationYear?: string | null;
  };
  academics: {
    school?: string | null;
    grade?: string | null;
    currentGradeLevel?: string | null;
    graduationYear?: string | null;
    gpa?: string | null;
    weightedGpa?: string | null;
    unweightedGpa?: string | null;
    classRank?: string | null;
    creditsEarned: number;
    dreamSchool?: string | null;
    intendedMajor?: string | null;
    sat: AcademicAssessment;
    act: AcademicAssessment;
    ap: any[];
    ib: any[];
    dualEnrollment: any[];
    academicHonors: any[];
    agProgress: CanonicalAgProgress[];
    agSummary: { subjectsMet: number; subjectCount: number; totalCompleted: number; totalRequired: number; percent: number };
    currentCourses: CanonicalCourse[];
    courseHistory: CanonicalCourse[];
    semesterHistory: any[];
    transcriptMetadata: { source: string; importedAt: string | null; lastUpdatedAt?: string | null; verified: boolean };
  };
  career: { idealProfession?: string | null; desiredSalaryRange?: string | null };
  achievements: { total: number; certificates: any[]; badges: any[]; activities: any[]; posts: any[] };
  service: { volunteerHours: number };
  readiness: { portfolioCompletion: number; opportunityReadiness: number };
  ai: Record<string, any>;
}

export interface ProfileAcademicForm {
  school: string;
  grade: string;
  gradYear: string;
  weightedGpa: string;
  unweightedGpa: string;
  satScore: string;
  actScore: string;
  intendedMajor: string;
  dreamSchool: string;
}
