import type { CommunityExperience, ScholarCommunityRecord } from "./community";

export interface ScholarRecord {
  id: string;
  identity: {
    username?: string;
    role?: string;
    fullName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    location?: string | null;
  };
  media: {
    avatarUrl?: string | null;
    coverPhotoUrl?: string | null;
    gallery: string[];
  };
  visibility: {
    isPublic: boolean;
    sections: Record<string, boolean>;
    rules: Record<string, boolean>;
  };
  academics: {
    school?: string | null;
    grade?: string | null;
    gpa?: string | null;
    sat?: string | number | null;
    act?: string | number | null;
    dreamSchool?: string | null;
    intendedMajor?: string | null;
  };
  goals: {
    collegeGoals?: string | null;
    dreamSchool?: string | null;
    intendedMajor?: string | null;
  };
  athletics: {
    sport?: string | null;
    position?: string | null;
    travelTeam?: string | null;
    coachName?: string | null;
    recruitingStatus?: string | null;
  };
  career: {
    idealProfession?: string | null;
    desiredSalaryRange?: string | null;
  };
  social: {
    instagram?: string | null;
    twitter?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
    website?: string | null;
  };
  community: ScholarCommunityRecord;
  achievements: {
    total: number;
    certificates: unknown[];
    badges: unknown[];
    activities: CommunityExperience[];
    awards: CommunityExperience[];
    certifications: CommunityExperience[];
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
  stats: {
    xp: number;
    coins: number;
    certificates: number;
    badges: number;
    posts: number;
    activities: number;
  };
  readiness: {
    portfolioCompletion: number;
    academicReadiness: number;
    careerReadiness: number;
    leadershipReadiness: number;
    opportunityReadiness: number;
  };
  future: {
    endorsements: unknown[];
    recommendations: unknown[];
  };
}
