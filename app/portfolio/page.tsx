import Link from "next/link";
import { redirect } from "next/navigation";
import PortfolioActions from "@/components/portfolio/PortfolioActions";
import ScholarRecordReadiness from "@/components/portfolio/ScholarRecordReadiness";
import { loadScholarPortfolioReadiness } from "@/lib/portfolio/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PortfolioPage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const [readiness, { data: shares }] = await Promise.all([
    loadScholarPortfolioReadiness(supabase, auth.user.id),
    supabase.from("portfolio_shares").select("share_id,status,expires_at").eq("scholar_id", auth.user.id).order("created_at", { ascending: false }),
  ]);
  return <main style={{ maxWidth: 960, margin: "0 auto", padding: 36 }}>
    {readiness.ok ? <ScholarRecordReadiness completion={readiness.completion} /> : <section role="alert"><h1>Portfolio readiness unavailable</h1><p>{readiness.error}</p></section>}
    <PortfolioActions shares={shares || []} />
    <p>Packets are generated on the server from allowlisted identity, readiness, and verified-public-evidence fields.</p>
    <p><Link href="/evidence">Review evidence provenance</Link> · <Link href="/record">Update Scholar Record</Link></p>
  </main>;
}
