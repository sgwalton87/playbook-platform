export function buildRecommendations(input: {
  role?: string;
  trustScore?: number;
  academicProgress?: number;
  opportunities?: number;
  goals?: string[];
}) {
  const role = input.role || "scholar";
  const trustScore = input.trustScore ?? 70;
  const academicProgress = input.academicProgress ?? 75;
  const opportunities = input.opportunities ?? 0;

  const recommendations = [];

  if (academicProgress < 85) {
    recommendations.push({
      id: "academic-progress",
      priority: "high",
      title: "Close academic readiness gaps",
      reason: "Academic progress is below the readiness target.",
      action: role === "family" ? "Review course plan with scholar" : "Meet with counselor about next course.",
    });
  }

  if (trustScore < 85) {
    recommendations.push({
      id: "trust-score",
      priority: "medium",
      title: "Strengthen verified evidence",
      reason: "Higher trust improves confidence in the Scholar Record.",
      action: "Add or verify one evidence item.",
    });
  }

  if (opportunities > 0) {
    recommendations.push({
      id: "opportunity-next-step",
      priority: "high",
      title: "Act on matched opportunity",
      reason: "There are active opportunity matches waiting.",
      action: "Save one opportunity and complete the first step.",
    });
  }

  return recommendations;
}
