import type { CommunityExperience, ScholarCommunityRecord } from "./community";

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
    topSchools: string[];
    collegeList: string[];
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
}
