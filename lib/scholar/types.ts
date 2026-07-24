import type { CommunityExperience, ScholarCommunityRecord } from "./community";
import type { ExperienceCollection } from "@/lib/experiences";

export interface ScholarRecord {
  id: string;
  identity: {
    username?: string;
    role?: string;
    fullName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    school?: string | null;
  };
  academics: {
    school?: string | null;
    grade?: string | null;
    gpa?: string | null;
    dreamSchool?: string | null;
    weightedGpa?: string | null;
    unweightedGpa?: string | null;
    intendedMajor?: string | null;
    sat?: string | null;
    act?: string | null;
  };
  career: {
    idealProfession?: string | null;
    desiredSalaryRange?: string | null;
  };
  athletics?: {
    sport?: string | null;
    position?: string | null;
    travelTeam?: string | null;
    coachName?: string | null;
    recruitingStatus?: string | null;
  };
  community: ScholarCommunityRecord;
  experiences: ExperienceCollection;
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
    careerReadiness?: number;
  };
}
