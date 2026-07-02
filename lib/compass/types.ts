export type CompassPriority = "high" | "medium" | "low";

export interface CompassRecommendation {
  id: string;
  title: string;
  priority: CompassPriority;
  explanation: string;
  reasons: string[];
  nextSteps: string[];
}

export interface CompassReport {
  score: number;
  headline: string;
  summary: string;
  recommendations: CompassRecommendation[];
  nextActions: string[];
}
