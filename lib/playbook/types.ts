import type { StandardizedTestPlan } from "@/lib/education";

export type PlaybookRole =
  | "scholar"
  | "scholar-athlete"
  | "brand-partner"
  | "family"
  | "mentor"
  | "educator"
  | "coach"
  | "college-coach"
  | "college-admissions"
  | "transition-youth"
  | "employer"
  | "founder"
  | "other";

export type PlaybookIdentity = {
  id: string;
  email: string | null;

  role: string;
  profileMode: string;
  roles: string[];

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
  state: string | null;
  zipCode: string | null;
};

export type PlaybookDemographics = {
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

export type PlaybookAcademics = {
  school: string | null;
  schoolId: string | null;
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

  satTesting: StandardizedTestPlan;
  actTesting: StandardizedTestPlan;

  intendedMajor: string | null;
  idealProfession: string | null;
};

export type PlaybookCollege = {
  dreamSchool: string | null;
  dreamSchoolName: string | null;
  dreamSchoolId: string | null;
  topSchools: string[];
};

export type PlaybookTranscript = {
  uploaded: boolean;
  uploadUrl: string | null;
  filename: string | null;
  uploadedAt: string | null;

  courses: Array<Record<string, unknown>>;
  agProgress: Array<Record<string, unknown>>;
};

export type PlaybookActivity = {
  id?: string;
  category?: string;
  activity?: string;
  roleTitle?: string;
  organization?: string;
  description?: string;

  hoursPerWeek?: string | number;
  totalHours?: string | number;

  startDate?: string;
  endDate?: string;

  supervisor?: string;
  supervisorEmail?: string;

  achievements?: string[];
};

export type PlaybookActivities = {
  entries: PlaybookActivity[];
  pillars: string[];
  engagementPreferences: string[];
};

export type PlaybookAthletics = {
  primarySport: string | null;
  secondarySport: string | null;
  position: string | null;

  currentTeam: string | null;
  highSchoolTeam: string | null;
  travelTeam: string | null;
  teamLevel: string | null;

  height: string | null;
  weight: string | null;
  jerseyNumber: string | null;

  coachName: string | null;
  coachEmail: string | null;

  athleteEmail: string | null;
  highlightReelUrl: string | null;

  keyStatsHonors: string | null;
  recruitingStatus: string | null;
  recruitingInterest: string | null;
  desiredCollegeLevel: string | null;

  campsAttended: string | null;
};

export type SupportInvitationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "expired"
  | "revoked";

export type SupportRelationshipType =
  | "parent"
  | "guardian"
  | "family"
  | "mentor"
  | "coach"
  | "educator"
  | "advisor"
  | "counselor"
  | "supporter"
  | "other";

export type PlaybookSupportPermission = {
  canViewCompass: boolean;
  canViewAcademics: boolean;
  canViewTranscript: boolean;
  canViewActivities: boolean;
  canViewAthletics: boolean;
  canViewGoals: boolean;
  canMessage: boolean;
};

export type PlaybookSupportContact = {
  id?: string;

  name: string | null;
  email: string | null;

  relationship: SupportRelationshipType | string | null;

  invitationStatus: SupportInvitationStatus;
  invitationToken?: string | null;

  linkedProfileId?: string | null;
  messageThreadId?: string | null;

  permissions: PlaybookSupportPermission;
};

export type PlaybookSupportSystem = {
  contacts: PlaybookSupportContact[];
};

export type PlaybookPrivacy = {
  publicProfileComplete: boolean;
  communitySafetyAgreed: boolean;
  communitySafetyAgreedAt: string | null;
  communitySafetyPolicyVersion: string | null;
};

export type PlaybookPreferences = {
  engagementPreferences: string[];
};

export type PlaybookOnboarding = {
  data: Record<string, unknown>;
  complete: boolean;
  completedAt: string | null;
};

export type PlaybookProfile = {
  id: string;

  identity: PlaybookIdentity;
  demographics: PlaybookDemographics;
  academics: PlaybookAcademics;
  college: PlaybookCollege;
  transcript: PlaybookTranscript;
  activities: PlaybookActivities;
  athletics: PlaybookAthletics;
  supportSystem: PlaybookSupportSystem;
  privacy: PlaybookPrivacy;
  preferences: PlaybookPreferences;
  onboarding: PlaybookOnboarding;

  createdAt: string | null;
  updatedAt: string | null;
};

export type PlaybookProfileSource = {
  profile?: Record<string, any> | null;
  authEmail?: string | null;
  agProgress?: Array<Record<string, unknown>> | null;
  transcriptCourses?: Array<Record<string, unknown>> | null;
};
