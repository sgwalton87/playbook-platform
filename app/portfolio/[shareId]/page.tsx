import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { canViewPortfolioShare } from "@/lib/portfolio-sharing";

export default async function SharedPortfolioPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const supabase = createAdminSupabaseClient();
  const { data: share } = await supabase.from("portfolio_shares").select("share_id,scholar_name,target_use,packet,status,expires_at").eq("share_id", shareId).maybeSingle();
  if (!share || !canViewPortfolioShare({ status: share.status, expiresAt: share.expires_at })) notFound();
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: 36 }}><p>Controlled Scholar Portfolio</p><h1>{share.scholar_name}</h1><p>Prepared for: {share.target_use}</p><section><h2>Readiness packet</h2><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(share.packet, null, 2)}</pre></section><aside>This link provides read-only access and may expire or be revoked by the Scholar.</aside></main>;
}
