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
  college: {
    dreamSchool?: string | null;
    dreamSchoolName?: string | null;
    dreamSchoolId?: string | null;
    topSchools: string[];
  };
  career: {
    idealProfession?: string | null;
    desiredSalaryRange?: string | null;
  };
  achievements: {
    total: number;
    certificates: any[];
    badges: any[];
    activities: any[];
    posts: any[];
  };
  service: {
    volunteerHours: number;
  };
  readiness: {
    portfolioCompletion: number;
    opportunityReadiness: number;
  };
}
