import type { CommunityExperience, ScholarCommunityRecord } from "./community";
import type { CanonicalAIProfile } from "../portfolio/ai-foundation";

export interface ScholarRecord {
  id: string;
  identity: {
    username?: string;
    role?: string;
    fullName: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  academics: {
    school?: string | null;
    grade?: string | null;
    gpa?: string | null;
    dreamSchool?: string | null;
  };
  career: {
    idealProfession?: string | null;
    desiredSalaryRange?: string | null;
  };
  community: ScholarCommunityRecord;
  achievements: {
    total: number;
    certificates: unknown[];
    badges: unknown[];
    activities: CommunityExperience[];
    posts: unknown[];
  };
  service: {
    volunteerHours: number;
    activities: CommunityExperience[];
  };
  leadership: {
    badges: unknown[];
    activities: CommunityExperience[];
    leadershipPositions: CommunityExperience[];
    leadershipScore: number;
  };
  readiness: {
    portfolioCompletion: number;
    opportunityReadiness: number;
  };
  canonicalAIProfile: CanonicalAIProfile;
  canonicalResume: CanonicalAIProfile["resume"];
  canonicalScholarship: CanonicalAIProfile["scholarship"];
  canonicalRecruiting: CanonicalAIProfile["recruiting"];
  canonicalAcademicSummary: CanonicalAIProfile["academics"];
  canonicalStudentSnapshot: CanonicalAIProfile["studentSnapshot"];
}
