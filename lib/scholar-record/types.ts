export type ScholarRecordValue =
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

  elaScore: string | number | null;
  mathScore: string | number | null;
  satScore: string | number | null;
  actScore: string | number | null;

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

export type ScholarCommunityProfile = {
  pillars: string[];
  activities: Array<Record<string, unknown>>;
  engagementPreferences: string[];
  supporters: string[];
};

export type ScholarRecord = {
  id: string;

  identity: ScholarIdentity;
  academic: ScholarAcademicProfile;
  college: ScholarCollegeProfile;
  transcript: ScholarTranscriptProfile;
  community: ScholarCommunityProfile;

  onboarding: Record<string, unknown>;

  onboardingComplete: boolean;
  publicProfileComplete: boolean;

  createdAt: string | null;
  updatedAt: string | null;
};

export type ScholarRecordSource = {
  profile?: Record<string, any> | null;
  authEmail?: string | null;
  agProgress?: Array<Record<string, unknown>> | null;
  transcriptCourses?: Array<Record<string, unknown>> | null;
};
