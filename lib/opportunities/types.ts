export type OpportunityType =
  | "scholarship"
  | "college"
  | "internship"
  | "career"
  | "leadership"
  | "athletics"
  | "mentorship";

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  description: string;
  readiness: number;
  reasons: string[];
  nextSteps: string[];
}
