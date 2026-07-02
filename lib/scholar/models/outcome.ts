export type OutcomeType =
  | "skill"
  | "award"
  | "certificate"
  | "admission"
  | "scholarship"
  | "job"
  | "internship"
  | "offer"
  | "service_hours"
  | "leadership"
  | "other";

export interface Outcome {
  id: string;
  type: OutcomeType;
  title: string;
  description?: string;
  value?: string | number;
  date?: string;
}
