import { supabase } from "@/lib/supabaseClient";
import type { OpportunityMatch } from "@/lib/opportunity-graph/types";

export async function saveOpportunityGraphMatches(input: {
  recordId: string;
  profileId?: string;
  matches: OpportunityMatch[];
}) {
  if (!input.recordId || input.matches.length === 0) {
    return { data: null, error: null };
  }

  const rows = input.matches.slice(0, 10).map(match => ({
    record_id: input.recordId,
    opportunity_type: match.opportunity.type,
    title: match.opportunity.title,
    description: match.opportunity.description,
    readiness_score: match.score,
    reasons: match.reasons,
    next_steps: match.nextSteps,
    status: "recommended",
    metadata: {
      opportunity_id: match.opportunity.id,
      tags: match.opportunity.tags,
      requirements: match.opportunity.requirements,
    },
    ai_context: {
      source: "opportunity_graph",
      score: match.score,
    },
    created_by: input.profileId || null,
    updated_by: input.profileId || null,
  }));

  return supabase.from("opportunity_matches").insert(rows);
}
