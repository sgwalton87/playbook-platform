import { supabase } from "@/lib/supabaseClient";

export async function createAcademicTimelineEvent(input: {
  recordId: string;
  title: string;
  description?: string;
  profileId?: string;
}) {
  return supabase.from("timeline_events").insert({
    record_id: input.recordId,
    event_type: "academic_intelligence",
    title: input.title,
    description: input.description || null,
    event_date: new Date().toISOString(),
    source: "academic_engine",
    verified: false,
    created_by: input.profileId || null,
    updated_by: input.profileId || null,
  });
}
