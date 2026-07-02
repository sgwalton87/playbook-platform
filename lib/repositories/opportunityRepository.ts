import { supabase } from "@/lib/supabaseClient";

export async function createOpportunityMatch(match: {
  recordId: string;
  opportunityType: string;
  title: string;
  description?: string;
  readinessScore?: number;
  reasons?: string[];
  nextSteps?: string[];
  status?: string;
  profileId?: string;
}) {
  return supabase.from("opportunity_matches").insert({
    record_id: match.recordId,
    opportunity_type: match.opportunityType,
    title: match.title,
    description: match.description || null,
    readiness_score: match.readinessScore || 0,
    reasons: match.reasons || [],
    next_steps: match.nextSteps || [],
    status: match.status || "recommended",
    created_by: match.profileId || null,
    updated_by: match.profileId || null,
  });
}
