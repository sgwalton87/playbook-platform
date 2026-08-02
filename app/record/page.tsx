import { redirect } from "next/navigation";
import CreateAchievementForm from "@/components/playbook-record/CreateAchievementForm";
import ForbiddenState from "@/components/auth/ForbiddenState";
import ScholarRecordReadiness from "@/components/portfolio/ScholarRecordReadiness";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { loadScholarPortfolioReadiness } from "@/lib/portfolio/server";
import { loadLaunchDashboardSummary } from "@/lib/launch-readiness/server";
import TrustSummaryCard from "@/components/trust/TrustSummaryCard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RecordPage({ searchParams }: { searchParams: Promise<{ scholarId?: string }> }) {
  const { scholarId } = await searchParams;
  const authorization = await resolveServerAuthorization({ scholarId, permission: "view_progress" });
  if (!authorization.authorized && authorization.reason === "unauthenticated") redirect("/login");
  if (!authorization.authorized) return <ForbiddenState reason="Select an active Scholar relationship with progress access." />;
  const supabase = await createServerSupabaseClient();
  const [readiness, launch] = await Promise.all([loadScholarPortfolioReadiness(supabase, authorization.scholarId), loadLaunchDashboardSummary(supabase, authorization.scholarId)]);
  const ownerCanEdit = authorization.relationship === null;
  return <main style={{ minHeight: "100vh", background: "#F8F7F4", padding: 36 }}><div style={{ maxWidth: 760, margin: "0 auto" }}>
    {launch.ok && <TrustSummaryCard summary={launch.summary.trust} title="Scholar Record trust" />}
    {readiness.ok ? <ScholarRecordReadiness completion={readiness.completion} /> : <section role="alert"><h1>Readiness unavailable</h1><p>{readiness.error}</p></section>}
    {ownerCanEdit ? <CreateAchievementForm profileId={authorization.identity.id} /> : <aside>This relationship provides a read-only Scholar Record readiness view.</aside>}
  </div></main>;
}
