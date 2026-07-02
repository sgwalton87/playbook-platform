export interface Portfolio {

  identity: Identity;

  academics: Academics;

  achievements: Achievement[];

  skills: Skill[];

  timeline: TimelineEvent[];

  recommendations: Recommendation[];

  opportunities: Opportunity[];

}

export interface Identity {

  id: string;

  username: string;

  firstName: string;

  lastName: string;

  avatarUrl?: string;

  bannerUrl?: string;

  bio?: string;

  school?: string;

  graduationYear?: number;

}

export interface Academics {

  gpa?: number;

  dreamSchool?: string;

  idealProfession?: string;

  desiredSalaryRange?: string;

}

export interface Achievement {

  id: string;

  title: string;

  category: string;

 

