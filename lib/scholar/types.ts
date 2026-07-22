export type PlaybookRecordArtifact = Record<string, unknown>;

export interface ScholarProfile extends Record<string, unknown> {
  id?: string;
  username?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  school?: string;
  grade?: string;
  graduation_year?: string | number;
  grad_year?: string | number;
  gpa?: string | number;
  weighted_gpa?: string | number;
  unweighted_gpa?: string | number;
  dream_school?: string;
  intended_major?: string;
  sat_score?: string | number;
  act_score?: string | number;
  ideal_profession?: string;
  desired_salary_range?: string;
  sport?: string;
  position?: string;
  height?: string;
  weight?: string;
  coach_name?: string;
  coach_email?: string;
  travel_team?: string;
  recruiting_status?: string;
  recruiting_interest?: string;
  highlight_video?: string;
  highlight_reel_url?: string;
  onboarding_data?: Record<string, unknown> | null;
}

export interface PlaybookRecord {
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
    gpa?: string | number | null;
    dreamSchool?: string | null;
  };
  career: {
    idealProfession?: string | null;
    desiredSalaryRange?: string | null;
  };
  achievements: {
    total: number;
    certificates: PlaybookRecordArtifact[];
    badges: PlaybookRecordArtifact[];
    activities: PlaybookRecordArtifact[];
    posts: PlaybookRecordArtifact[];
  };
  service: {
    volunteerHours: number;
  };
  readiness: {
    portfolioCompletion: number;
    opportunityReadiness: number;
  };
}
