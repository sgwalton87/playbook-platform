import { supabase } from "@/lib/supabaseClient";

export async function createTrustReport(report: {
  recordId: string;
  trustScore: number;
  trustLevel: string;
  signals?: LegacyValue[];
  missing?: string[];
  profileId?: string;
}) {
  return supabase.from("trust_reports").insert({
    record_id: report.recordId,
    trust_score: report.trustScore,
    trust_level: report.trustLevel,
    signals: report.signals || [],
    missing: report.missing || [],
    created_by: report.profileId || null,
  });
}
