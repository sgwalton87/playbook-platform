import { supabase } from "@/lib/supabaseClient";

export async function createTimelineEvent(event: {
  recordId: string;
  achievementId?: string;
  eventType: string;
  title: string;
  description?: string;
  source?: string;
  profileId?: string;
}) {
  return supabase.from("timeline_events").insert({
    record_id: event.recordId,
    achievement_id: event.achievementId || null,
    event_type: event.eventType,
    title: event.title,
    description: event.description || null,
    event_date: new Date().toISOString(),
    source: event.source || "timeline_engine",
    verified: false,
    created_by: event.profileId || null,
    updated_by: event.profileId || null,
  });
}
