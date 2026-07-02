import { createOpportunityMatch } from "@/lib/repositories/opportunityRepository";

export async function handleAchievementCreatedForCompass(payload: any) {
  if (!payload?.recordId) return;

  return createOpportunityMatch({
    recordId: payload.recordId,
    opportunityType: "mentorship",
    title: "Compass guidance",
    description: `Compass AI noticed "${payload.title}". Add evidence and request verification to increase trust.`,
    readinessScore: 10,
    reasons: ["New achievement detected"],
    nextSteps: ["Attach evidence", "Write a reflection", "Request verification"],
    status: "recommended",
    profileId: payload.profileId,
  });
}
