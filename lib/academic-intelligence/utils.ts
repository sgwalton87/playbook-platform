import type { IntelligenceStatus } from "@/lib/intelligence";

export function statusFromScore(score: number): IntelligenceStatus {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  return "Needs Attention";
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
