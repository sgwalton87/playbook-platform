import { redirect } from "next/navigation";
import AGTracker from "@/components/ag/AGTracker";
import LiveNextSteps from "@/components/dashboard/LiveNextSteps";
import TrustSummaryCard from "@/components/trust/TrustSummaryCard";
import { PlaybookButton, PlaybookCard, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";
import { loadLaunchDashboardSummary } from "@/lib/launch-readiness/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const result = await loadLaunchDashboardSummary(supabase, auth.user.id);
  if (!result.ok) return <main role="alert" style={{ padding: 40 }}><h1>Dashboard unavailable</h1><p>{result.error}</p></main>;
  const { summary } = result;
  return <PlaybookPage><PlaybookHero eyebrow="Scholar Dashboard" title={`Welcome, ${summary.scholarName}.`} subtitle="Live guidance comes from your authorized Scholar Record, evidence, verification, actions, and opportunities."><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}><PlaybookButton href="/record">Open Scholar Record</PlaybookButton><PlaybookButton href="/evidence" variant="secondary">Review Evidence</PlaybookButton></div></PlaybookHero>
    <PlaybookMetrics><PlaybookMetric label="Trust readiness" value={`${summary.trust.score}%`} /><PlaybookMetric label="Verified evidence" value={String(summary.trust.verifiedCount)} /><PlaybookMetric label="Opportunity matches" value={String(summary.opportunityCount)} /><PlaybookMetric label="Open support actions" value={String(summary.openActionCount)} /></PlaybookMetrics>
    <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(300px,.7fr)", gap: 18 }}><section><AGTracker /></section><section style={{ display: "grid", gap: 14 }}><LiveNextSteps trust={summary.trust} /><TrustSummaryCard summary={summary.trust} /><PlaybookCard eyebrow="Attention" title={`${summary.unreadNotificationCount} unread updates`}><p>Verification, intervention, opportunity, and milestone changes remain linked to their governed source.</p><PlaybookButton href="/notifications">Open notifications</PlaybookButton></PlaybookCard></section></div>
  </PlaybookPage>;
}
