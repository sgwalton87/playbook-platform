export interface CompassRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}
