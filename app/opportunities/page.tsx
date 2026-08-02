import Link from "next/link";
import { redirect } from "next/navigation";
import ForbiddenState from "@/components/auth/ForbiddenState";
import TrustSummaryCard from "@/components/trust/TrustSummaryCard";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { loadLaunchDashboardSummary } from "@/lib/launch-readiness/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OpportunitiesPage() {
  let authorization = await resolveServerAuthorization({ permission: "view_progress" });
  if (!authorization.authorized && authorization.reason === "unauthenticated") redirect("/login");
  if (!authorization.authorized) authorization = await resolveServerAuthorization({ permission: "view_verified_record" });
  if (!authorization.authorized) return <ForbiddenState reason="Select an active Scholar relationship with opportunity or verified-record access." />;
  const supabase = await createServerSupabaseClient();
  const [{ data, error }, launch] = await Promise.all([
    supabase.from("opportunity_matches").select("id,title,description,opportunity_type,readiness_score,reasons,next_steps,source_name,source_url,source_last_observed_at,expires_at,required_evidence,unknowns,confidence,role_context,status").eq("scholar_id", authorization.scholarId).eq("status", "recommended").or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order("readiness_score", { ascending: false }),
    loadLaunchDashboardSummary(supabase, authorization.scholarId),
  ]);
  if (error) throw new Error("Authorized opportunity recommendations are unavailable.");
  const matches = (data || []).filter((match) => match.source_name && match.source_last_observed_at);
  return <main style={{ maxWidth: 1000, margin: "0 auto", padding: 36 }}><header><p>Opportunity recommendations</p><h1>Evidence-backed options, not guesses.</h1><p>Every recommendation exposes its source, observation time, evidence requirements, unknowns, confidence, and expiration.</p></header>
    {launch.ok && <TrustSummaryCard summary={launch.summary.trust} title="Opportunity readiness trust" />}
    {matches.length === 0 ? <section role="status"><h2>No governed matches are available</h2><p>This is missing or insufficiently sourced data, not zero potential.</p><Link href="/evidence">Strengthen evidence</Link></section> : <section aria-label="Opportunity matches" style={{ display: "grid", gap: 16, marginTop: 20 }}>{matches.map((match) => <article key={match.id} style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 22 }}><p>{match.opportunity_type} · readiness {match.readiness_score}% · confidence {match.confidence ?? "not scored"}</p><h2>{match.title}</h2><p>{match.description}</p><dl><dt>Source</dt><dd>{match.source_name} · observed {new Date(match.source_last_observed_at).toLocaleDateString()}</dd><dt>Required evidence</dt><dd>{(match.required_evidence || []).join(", ") || "No requirements supplied"}</dd><dt>Unknowns</dt><dd>{(match.unknowns || []).join(", ") || "None recorded"}</dd><dt>Reasoning</dt><dd>{(match.reasons || []).join(" · ")}</dd></dl>{match.source_url && <a href={match.source_url} rel="noreferrer">Open authoritative source</a>}</article>)}</section>}
  </main>;
}
