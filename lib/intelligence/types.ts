export type IntelligenceStatus = "Excellent" | "Good" | "Needs Attention";

export interface IntelligenceReport {
  score: number;
  status: IntelligenceStatus;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  nextActions: string[];
}
