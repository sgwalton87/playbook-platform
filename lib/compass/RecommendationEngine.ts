import type { CompassRecommendation } from "./types";

export function buildCompassRecommendations(input: {
  gaps: string[];
  opportunityTitles?: string[];
}): CompassRecommendation[] {
  const recs: CompassRecommendation[] = [];

  if (input.gaps.some(g => g.includes("Academic"))) {
    recs.push({
      id: "academic-next-step",
      title: "Strengthen academic readiness",
      priority: "high",
      explanation: "Academic Intelligence needs more course evidence to improve recommendations.",
      reasons: ["Transcript data powers A-G, graduation, and opportunity matching."],
      nextSteps: ["Add transcript courses", "Confirm credits", "Review missing A-G areas"],
    });
  }

  if (input.gaps.some(g => g.includes("Trust"))) {
    recs.push({
      id: "trust-next-step",
      title: "Request verification",
      priority: "medium",
      explanation: "Verified achievements improve confidence in the Playbook Record.",
      reasons: ["Trust signals help opportunities become more credible."],
      nextSteps: ["Attach evidence", "Add reflection", "Request teacher or coach verification"],
    });
  }

  if (input.opportunityTitles?.length) {
    recs.push({
      id: "opportunity-next-step",
      title: "Review matched opportunities",
      priority: "high",
      explanation: "Your Opportunity Graph has active matches based on your Academic DNA.",
      reasons: input.opportunityTitles.slice(0, 3),
      nextSteps: ["Save top opportunities", "Choose one next action", "Track application status"],
    });
  }

  return recs;
}
