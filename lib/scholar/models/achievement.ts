import type { Evidence } from "./evidence";
import type { Verification } from "./verification";
import type { Reflection } from "./reflection";
import type { Outcome } from "./outcome";

export type AchievementCategory =
  | "academic"
  | "athletic"
  | "career"
  | "service"
  | "leadership"
  | "financial_literacy"
  | "entrepreneurship"
  | "creative"
  | "civic"
  | "personal_growth"
  | "other";

export interface Achievement {
  id: string;
  title: string;
  category: AchievementCategory;
  description?: string;
  startDate?: string;
  endDate?: string;
  organization?: string;
  role?: string;

  evidence: Evidence[];
  verification?: Verification;
  reflections: Reflection[];
  outcomes: Outcome[];

  skills?: string[];
  tags?: string[];
  visibility?: "private" | "school" | "network" | "public";
}
