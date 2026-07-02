import { createOpportunityMatch } from "@/lib/repositories/opportunityRepository";

export async function handleAchievementCreatedForOpportunities(payload: any) {
  if (!payload?.recordId) return;

  const opportunityType =
    payload.category === "academic" ? "scholarship" :
    payload.category === "athletic" ? "athletics" :
    payload.category === "career" ? "career" :
    payload.category === "leadership" ? "leadership" :
    "mentorship";

  return createOpportunityMatch({
    recordId: payload.recordId,
    opportunityType,
    title: "New opportunity signal detected",
    description:
      "This achievement may unlock new recommendations as the Playbook Record grows.",
    readinessScore: 25,
    reasons: ["Achievement added to Playbook Record"],
    nextSteps: ["Add evidence", "Request verification", "Add reflection"],
    status: "recommended",
    profileId: payload.profileId,
  });
}
