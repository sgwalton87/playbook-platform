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
    weightedGpa?: string | null;
    unweightedGpa?: string | null;
    intendedMajor?: string | null;
    sat?: string | null;
    act?: string | null;
  };
  athletics: {
    sport?: string | null;
    position?: string | null;
    height?: string | null;
    weight?: string | null;
    coachName?: string | null;
    coachEmail?: string | null;
    travelTeam?: string | null;
    recruitingStatus?: string | null;
    highlightVideo?: string | null;
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
    transcriptCompletion: number;
    collegeReadiness: number;
  };
  progress: {
    ag: ScholarAGProgress[];
  };
  economy: {
    coins: number;
    xp: number;
  };
  activity: {
    recent: ScholarActivityItem[];
    notifications: ScholarActivityItem[];
    upcomingDeadlines: ScholarDeadline[];
  };
}

export interface ScholarAGProgress {
  subject: string;
  years_completed: number | string | null;
  years_required: number | string | null;
  in_progress?: boolean | null;
  courses_taken?: string[] | null;
  current_course?: string | null;
}

export interface ScholarActivityItem {
  id: string;
  label: string;
  detail?: string | null;
  createdAt?: string | null;
  href?: string;
}

export interface ScholarDeadline {
  id: string;
  label: string;
  dueAt?: string | null;
  href?: string;
}
