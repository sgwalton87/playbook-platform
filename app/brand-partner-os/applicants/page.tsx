"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Opportunity = {
  id: string;
  opportunity_type: string;
  title: string;
  status: string;
  deadline: string | null;
  published_at: string | null;
};

type Applicant = {
  submission_id: string;
  scholar_display_name: string;
  scholar_username: string | null;
  scholar_avatar_url: string | null;
  application_status: string;
  submitted_at: string;
};

export default function BrandMarketplaceApplicantsPage() {
  return <BrandPartnerVerificationGate><ApplicantsWorkspace /></BrandPartnerVerificationGate>;
}

function ApplicantsWorkspace() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState("");

  const loadOpportunities = useCallback(async () => {
    setLoading(true); setError("");
    const result = await supabase.rpc("get_own_marketplace_opportunities");
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    const rows = ((result.data || []) as Opportunity[]).filter((item) => item.status === "published" || item.status === "closed");
    setOpportunities(rows);
    setSelectedId((current) => current && rows.some((item) => item.id === current) ? current : rows[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void loadOpportunities(); }, 0); return () => window.clearTimeout(timer); }, [loadOpportunities]);

  useEffect(() => {
    let active = true;
    if (!selectedId) return () => { active = false; };
    const timer = window.setTimeout(() => {
      setLoadingApplicants(true); setError("");
      void supabase.rpc("get_marketplace_applicants", { requested_opportunity_id: selectedId }).then((result) => {
        if (!active) return;
        if (result.error) { setError(result.error.message); setApplicants([]); }
        else setApplicants((result.data || []) as Applicant[]);
        setLoadingApplicants(false);
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [selectedId]);

  const selected = useMemo(() => opportunities.find((item) => item.id === selectedId) || null, [opportunities, selectedId]);

  return <PlaybookPage>
    <div data-testid="brand-marketplace-applicants" data-visual-canon="PGBP-APP-001">
      <PlaybookHero eyebrow="Brand Partner Marketplace" title="Opportunity Applicants" subtitle="View only Scholars who explicitly shared a submitted Application Workspace with one of your published Marketplace opportunities. Publication alone grants no applicant access.">
        <div style={actions}><PlaybookButton href="/brand-partner-os">Brand Partner OS</PlaybookButton><PlaybookButton href="/brand-partner-os/opportunities" variant="secondary">Opportunity Listings</PlaybookButton></div>
      </PlaybookHero>
      <PlaybookMetrics>
        <PlaybookMetric label="Published / closed listings" value={loading ? "…" : String(opportunities.length)} />
        <PlaybookMetric label="Consented applicants" value={loadingApplicants ? "…" : String(applicants.length)} />
        <PlaybookMetric label="Private documents" value="Not exposed" />
        <PlaybookMetric label="Selection automation" value="None" />
      </PlaybookMetrics>

      <section style={trustPanel}><PlaybookPill>Consent-bound visibility</PlaybookPill><h2 style={trustTitle}>Applicant visibility is narrow by design.</h2><p style={trustCopy}>This roster contains only applicant identity, submission time, and workspace status. It does not expose email, phone, essays, resume snapshots, application documents, recommendations, evidence, academic records, support relationships, or other Scholar Record data. A Scholar can withdraw sharing.</p></section>

      {error ? <div role="alert" style={alert}>{error}</div> : null}

      {loading ? <div style={empty}>Loading owned Marketplace opportunities…</div> : opportunities.length === 0 ? <PlaybookCard eyebrow="Opportunity applicants" title="No published opportunities yet"><p style={copy}>Publish a Marketplace listing through human review first. Playbook does not fabricate applicants or open Scholar records just because a partner is verified.</p></PlaybookCard> : <>
        <label style={selector}>Opportunity<select value={selectedId} onChange={(event) => { setApplicants([]); setSelectedId(event.target.value); }} style={select}>{opportunities.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.status}</option>)}</select></label>
        {selected ? <div style={selectedRail}><div><PlaybookPill>{selected.opportunity_type}</PlaybookPill><h2 style={selectedTitle}>{selected.title}</h2></div><p style={selectedCopy}>{selected.deadline ? `Deadline ${selected.deadline}` : "No listed deadline"} · {selected.status}</p></div> : null}
        {loadingApplicants ? <div style={empty}>Loading consented applicant roster…</div> : applicants.length === 0 ? <PlaybookCard eyebrow="Consented applicants" title="No active applicant shares"><p style={copy}>No Scholar has explicitly shared a submitted Application Workspace with this opportunity. That is a valid empty state; publication does not create applicant access.</p></PlaybookCard> : <PlaybookGrid min={320}>{applicants.map((applicant) => <PlaybookCard key={applicant.submission_id} eyebrow="Consented applicant" title={applicant.scholar_display_name}>
          <div style={pillRow}><PlaybookPill>{applicant.application_status}</PlaybookPill><PlaybookPill>Shared {new Date(applicant.submitted_at).toLocaleDateString()}</PlaybookPill></div>
          {applicant.scholar_username ? <p style={copy}>@{applicant.scholar_username}</p> : null}
          <p style={muted}>This roster intentionally provides no private application packet or contact data. Future packet access requires a separate explicit sharing contract.</p>
        </PlaybookCard>)}</PlaybookGrid>}
      </>}
    </div>
  </PlaybookPage>;
}

const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
const selector: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "grid", gap: 6, color: "#334155", fontWeight: 850 };
const select: React.CSSProperties = { minHeight: 46, border: "1px solid #CBD5E1", borderRadius: 10, padding: "0 12px", background: "#FFF", font: "inherit" };
const selectedRail: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 18, border: "1px solid #CBD5E1", borderRadius: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" };
const selectedTitle: React.CSSProperties = { margin: "8px 0 0", color: "#0F172A" };
const selectedCopy: React.CSSProperties = { color: "#64748B", margin: 0 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const muted: React.CSSProperties = { color: "#64748B", fontSize: 12, lineHeight: 1.55 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 };
