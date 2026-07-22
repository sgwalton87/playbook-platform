import type { StandardizedTestPlan } from "@/lib/education";
import type { AthleticsProfile } from "@/lib/athletics";

export type PlaybookRecordValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export type ScholarIdentity = {
  id: string;
  email: string | null;
  role: string;
  profileMode: string;

  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  username: string | null;

  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;

  gender: string | null;
  dateOfBirth: string | null;
  favoriteQuote: string | null;

  city: string | null;
  zipCode: string | null;
};

export type ScholarAcademicProfile = {
  school: string | null;
  schoolDistrict: string | null;
  grade: string | null;

  graduationYear: string | number | null;

  gpa: string | number | null;
  weightedGpa: string | number | null;
  unweightedGpa: string | number | null;
  currentMath: string | null;
currentEnglish: string | null;
currentScience: string | null;

  elaScore: string | number | null;
  mathScore: string | number | null;
  satScore: string | number | null;
  actScore: string | number | null;

  satTesting: StandardizedTestPlan;
  actTesting: StandardizedTestPlan;

  intendedMajor: string | null;
  idealProfession: string | null;
};

export type ScholarCollegeProfile = {
  dreamSchool: string | null;
  dreamSchoolName: string | null;
  dreamSchoolId: string | null;
  topSchools: string[];
};

export type ScholarTranscriptProfile = {
  uploaded: boolean;
  uploadUrl: string | null;
  filename: string | null;
  uploadedAt: string | null;

  courses: Array<Record<string, unknown>>;
  agProgress: Array<Record<string, unknown>>;
};

export type ScholarDemographics = {
  raceEthnicity: string[];
  lgbtqiaAffinity: string | null;
  householdIncome: string | null;
  firstGeneration: string | boolean | null;
  ellStatus: string | boolean | null;
  freeReducedLunch: string | boolean | null;
  migrantStudent: string | boolean | null;
  fosterYouth: string | boolean | null;
  housingInsecurity: string | boolean | null;
  hasIep: string | boolean | null;
};

export type ScholarCommunityProfile = {
  pillars: string[];
  activities: Array<Record<string, unknown>>;
  engagementPreferences: string[];
  supporters: string[];
};

export type PlaybookRecord = {
  id: string;

  identity: ScholarIdentity;
  demographics: ScholarDemographics;
  academic: ScholarAcademicProfile;
  college: ScholarCollegeProfile;
  transcript: ScholarTranscriptProfile;
  community: ScholarCommunityProfile;
  athletics: AthleticsProfile;

  onboarding: Record<string, unknown>;

  onboardingComplete: boolean;
  publicProfileComplete: boolean;

  createdAt: string | null;
  updatedAt: string | null;
};

export type PlaybookRecordSource = {
  profile?: Record<string, any> | null;
  authEmail?: string | null;
  agProgress?: Array<Record<string, unknown>> | null;
  transcriptCourses?: Array<Record<string, unknown>> | null;
};
