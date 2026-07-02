export interface ScholarRecord {
  id: string;
  username?: string | null;
  role?: string | null;

  identity: {
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    avatarUrl?: string | null;
    school?: string | null;
    grade?: string | null;
    graduationYear?: string | null;
  };

  academics: {
    gpa?: string | number | null;
    weightedGpa?: string | number | null;
    unweightedGpa?: string | number | null;
    dreamSchool?: string | null;
    intendedMajor?: string | null;
    satScore?: string | number | null;
    actScore?: string | number | null;
  };

  career: {
    idealProfession?: string | null;
    desiredSalaryRange?: string | null;
  };

  athletics?: {
    sport?: string | null;
    position?: string | null;
    coachName?: string | null;
    travelTeam?: string | null;
    recruitingStatus?: string | null;
    highlightVideo?: string | null;
  };

  achievements: {
    certificates: any[];
    badges: any[];
    activities: any[];
    posts: any[];
  };

  readiness: {
    portfolioCompletion: number;
    academicReadiness: number;
    careerReadiness: number;
    opportunityReadiness: number;
    leadershipReadiness: number;
  };
}
