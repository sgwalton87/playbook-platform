import "server-only";

import { buildTrustSummary } from "./trustSummary";
import type { LaunchDashboardSummary } from "./types";

export async function loadLaunchDashboardSummary(supabase: LegacyValue, scholarId: string): Promise<{ ok: true; summary: LaunchDashboardSummary } | { ok: false; error: string }> {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [profileResult, evidenceResult, verifiedResult, pendingResult, activityResult, opportunityResult, notificationResult, actionResult] = await Promise.all([
    supabase.from("profiles").select("id,full_name,username").eq("id", scholarId).maybeSingle(),
    supabase.from("evidence").select("id", { count: "exact", head: true }).eq("owner_id", scholarId).is("deleted_at", null),
    supabase.from("evidence").select("id", { count: "exact", head: true }).eq("owner_id", scholarId).eq("verification_state", "verified").is("deleted_at", null),
    supabase.from("evidence_verification_requests").select("id", { count: "exact", head: true }).eq("scholar_id", scholarId).in("status", ["pending", "in_review"]),
    supabase.from("timeline_events").select("id", { count: "exact", head: true }).eq("created_by", scholarId).gte("created_at", since).is("deleted_at", null),
    supabase.from("opportunity_matches").select("id", { count: "exact", head: true }).eq("scholar_id", scholarId).eq("status", "recommended").or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", scholarId).eq("read", false),
    supabase.from("role_action_handoffs").select("id", { count: "exact", head: true }).eq("scholar_id", scholarId).in("status", ["assigned", "accepted", "in_progress"]),
  ]);
  if (profileResult.error || !profileResult.data) return { ok: false, error: "Authorized Scholar profile unavailable." };
  const trust = buildTrustSummary({ evidenceCount: evidenceResult.count || 0, verifiedCount: verifiedResult.count || 0, pendingVerificationCount: pendingResult.count || 0, recentActivityCount: activityResult.count || 0 });
  return { ok: true, summary: { scholarId, scholarName: profileResult.data.full_name || profileResult.data.username || "Scholar", trust, opportunityCount: opportunityResult.count || 0, unreadNotificationCount: notificationResult.count || 0, openActionCount: actionResult.count || 0 } };
}
