export type OpportunityType =
  | "scholarship"
  | "internship"
  | "mentor"
  | "college"
  | "career"
  | "summer_program"
  | "competition"
  | "grant"
  | "volunteer"
  | "nil"
  | "research";

export interface OpportunityNode {
  id: string;
  title: string;
  type: OpportunityType;
  description: string;
  tags: string[];
  skills: string[];
  majors: string[];
  careers: string[];
  requirements: string[];
  nextSteps: string[];
  readinessWeight: number;
}

export interface OpportunityMatch {
  opportunity: OpportunityNode;
  score: number;
  reasons: string[];
  nextSteps: string[];
}

export interface OpportunityGraphReport {
  score: number;
  matches: OpportunityMatch[];
  topSkills: string[];
  topMajors: string[];
  topCareers: string[];
  recommendations: string[];
}
