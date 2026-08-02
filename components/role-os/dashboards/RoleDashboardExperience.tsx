import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";
import TrustSummaryCard from "@/components/trust/TrustSummaryCard";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { loadLaunchDashboardSummary } from "@/lib/launch-readiness/server";
import { buildRoleDashboardCards } from "@/lib/launch-readiness/roleCards";
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import type { PlaybookRoleOS } from "@/lib/role-os";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PERMISSION_BY_ROLE = { learner: "view_progress", family: "view_progress", educator: "view_progress", mentor: "view_progress", district: "view_evidence", university: "view_verified_record", employer: "view_verified_record" } as const;

export default async function RoleDashboardExperience({ role }: { role: PlaybookRoleOS }) {
  const dashboard = getRoleDashboard(role);
  const authorization = await resolveServerAuthorization({ permission: PERMISSION_BY_ROLE[role] });
  const supabase = await createServerSupabaseClient();
  const result = authorization.authorized ? await loadLaunchDashboardSummary(supabase, authorization.scholarId) : null;
  const summary = result?.ok ? result.summary : null;
  const cards = buildRoleDashboardCards(role, summary);
  return <PlaybookPage><PlaybookHero eyebrow={`${role} OS`} title={dashboard.title} subtitle={summary ? `Authorized context: ${summary.scholarName}. Live signals come from persisted Scholar data.` : "Select an active, permission-bearing Scholar relationship to load live signals."}><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}><PlaybookButton href="/support-network">Scholar relationships</PlaybookButton><PlaybookButton href="/messages" variant="secondary">Messages</PlaybookButton></div></PlaybookHero>
    <PlaybookMetrics><PlaybookMetric label="Trust readiness" value={summary ? `${summary.trust.score}%` : "Restricted"} /><PlaybookMetric label="Verified evidence" value={summary ? String(summary.trust.verifiedCount) : "—"} /><PlaybookMetric label="Open actions" value={summary ? String(summary.openActionCount) : "—"} /><PlaybookMetric label="Opportunities" value={summary ? String(summary.opportunityCount) : "—"} /></PlaybookMetrics>
    <PlaybookGrid min={300}>{summary && <TrustSummaryCard summary={summary.trust} title={`${summary.scholarName} trust`} />}{cards.map((card) => <PlaybookCard key={card.id} eyebrow={`${role} OS`} title={card.title}><p style={{ color: "#475569", lineHeight: 1.6 }}>{card.body}</p><PlaybookButton href={card.href}>{card.action}</PlaybookButton></PlaybookCard>)}</PlaybookGrid>
  </PlaybookPage>;
}
