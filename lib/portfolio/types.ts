export type PortfolioRole =
  | "scholar"
  | "scholar_athlete"
  | "parent"
  | "mentor"
  | "coach"
  | "educator"
  | "admin"
  | "founder";

export interface PortfolioIdentity {
  id: string;
  username?: string | null;
  role?: PortfolioRole | string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  school?: string | null;
  city?: string | null;
  state?: string | null;
  grade?: string | null;
  graduationYear?: string | null;
}

export interface PortfolioAcademics {
  weightedGpa?: string | null;
  unweightedGpa?: string | null;
  dreamSchool?: string | null;
  intendedMajor?: string | null;
  satScore?: string | null;
  actScore?: string | null;
}

export interface PortfolioCareer {
  idealProfession?: string | null;
  desiredSalaryRange?: string | null;
}

export interface PortfolioAthletics {
  sport?: string | null;
  position?: string | null;
  height?: string | null;
  weight?: string | null;
  travelTeam?: string | null;
  coachName?: string | null;
  coachEmail?: string | null;
  recruitingStatus?: string | null;
  highlightVideo?: string | null;
}

export interface Portfolio {
  identity: PortfolioIdentity;
  academics: PortfolioAcademics;
  career: PortfolioCareer;
  athletics?: PortfolioAthletics;
  pillars: string[];
}
