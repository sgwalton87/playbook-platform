"use client";

import { useCallback, useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type ReviewListing = {
  id: string;
  organization_name: string;
  opportunity_type: string;
  title: string;
  description: string;
  location: string | null;
  external_url: string | null;
  deadline: string | null;
  compensation_summary: string | null;
  eligibility: string[];
  requirements: string[];
  tags: string[];
  status: "review_requested" | "published";
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export default function MarketplaceOpportunityReviewPage() {
  const [listings, setListings] = useState<ReviewListing[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const result = await supabase.rpc("get_marketplace_opportunities_for_review");
    if (result.error) {
      const denied = result.error.code === "42501" || result.error.message.toLowerCase().includes("operator authority");
      if (denied) setForbidden(true); else setError(result.error.message);
      setLoading(false); return;
    }
    setForbidden(false); setListings((result.data || []) as ReviewListing[]); setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function decide(listing: ReviewListing, decision: "approve" | "request_changes" | "reject" | "close") {
    setBusy(`${listing.id}:${decision}`); setError(""); setMessage("");
    const result = await supabase.rpc("review_marketplace_opportunity", {
      requested_opportunity_id: listing.id,
      requested_decision: decision,
      requested_notes: notes[listing.id]?.trim() || null,
    });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage(decision === "approve" ? `${listing.title} is now published.` : decision === "close" ? `${listing.title} was closed.` : `${listing.title} review decision recorded.`);
    await load(); setBusy("");
  }

  if (forbidden) return <PlaybookPage><PlaybookHero eyebrow="Governed access" title="Marketplace Publication Review" subtitle="This workspace is restricted to Playbook platform operators." /><PlaybookCard eyebrow="Default deny" title="Operator authority required"><p style={copy}>Brand Partners can request review but cannot approve their own Marketplace listings.</p></PlaybookCard></PlaybookPage>;

  const pending = listings.filter((item) => item.status === "review_requested").length;
  const published = listings.filter((item) => item.status === "published").length;

  return <PlaybookPage>
    <div data-testid="marketplace-opportunity-review" data-visual-canon="PGMO-REVIEW-001">
      <PlaybookHero eyebrow="Founder / Admin" title="Marketplace Publication Review" subtitle="Human review is the publication boundary between a verified Brand Partner draft and a real Scholar-visible Marketplace opportunity.">
        <div style={actions}><PlaybookButton href="/admin">Admin Review Center</PlaybookButton><PlaybookButton href="/opportunities" variant="secondary">Scholar Marketplace</PlaybookButton></div>
      </PlaybookHero>
      <PlaybookMetrics><PlaybookMetric label="Review requested" value={loading ? "…" : String(pending)} /><PlaybookMetric label="Published in queue" value={loading ? "…" : String(published)} /><PlaybookMetric label="Publication authority" value="Human operator" /><PlaybookMetric label="Applicant access" value="Not granted" /></PlaybookMetrics>
      <section style={trustPanel}><PlaybookPill>Human authority</PlaybookPill><h2 style={trustTitle}>Publication is not selection, compliance approval, or NIL contract approval.</h2><p style={trustCopy}>Review confirms that Playbook will surface the listing as a real opportunity. It does not choose Scholars, approve a NIL deal, guarantee compensation, or expose applicant records.</p></section>
      {error ? <div role="alert" style={alert}>{error}</div> : null}{message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}
      {loading ? <div style={empty}>Loading publication review queue…</div> : listings.length === 0 ? <PlaybookCard eyebrow="Publication review" title="No listings awaiting or carrying publication status"><p style={copy}>The queue is empty. Playbook does not fabricate review items.</p></PlaybookCard> : <PlaybookGrid min={360}>{listings.map((listing) => <PlaybookCard key={listing.id} eyebrow={`${listing.organization_name} · ${listing.opportunity_type}`} title={listing.title}>
        <div style={pillRow}><PlaybookPill>{listing.status.replaceAll("_", " ")}</PlaybookPill>{listing.deadline ? <PlaybookPill>Deadline {listing.deadline}</PlaybookPill> : null}</div>
        <p style={copy}>{listing.description}</p>
        {listing.location ? <p style={copy}><strong>Location:</strong> {listing.location}</p> : null}
        {listing.compensation_summary ? <p style={copy}><strong>Compensation / award:</strong> {listing.compensation_summary}</p> : null}
        {listing.eligibility?.length ? <section><h3 style={subheading}>Eligibility</h3><ul style={list}>{listing.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        {listing.requirements?.length ? <section><h3 style={subheading}>Requirements</h3><ul style={list}>{listing.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        <label style={field}>Review notes<textarea value={notes[listing.id] || ""} onChange={(e) => setNotes((current) => ({ ...current, [listing.id]: e.target.value }))} maxLength={4000} style={textarea} placeholder="Document publication concerns or requested changes." /></label>
        <div style={decisionRow}>{listing.status === "review_requested" ? <><button type="button" disabled={busy.startsWith(listing.id)} onClick={() => void decide(listing,"approve")} style={approve}>Approve publication</button><button type="button" disabled={busy.startsWith(listing.id)} onClick={() => void decide(listing,"request_changes")} style={secondary}>Request changes</button><button type="button" disabled={busy.startsWith(listing.id)} onClick={() => void decide(listing,"reject")} style={danger}>Reject</button></> : <button type="button" disabled={busy.startsWith(listing.id)} onClick={() => void decide(listing,"close")} style={danger}>Close published listing</button>}</div>
      </PlaybookCard>)}</PlaybookGrid>}
    </div>
  </PlaybookPage>;
}

const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 };
const subheading: React.CSSProperties = { fontSize: 14, color: "#0F172A", marginBottom: 4 };
const list: React.CSSProperties = { color: "#475569", lineHeight: 1.55, paddingLeft: 20 };
const field: React.CSSProperties = { display: "grid", gap: 6, marginTop: 14, color: "#334155", fontWeight: 850 };
const textarea: React.CSSProperties = { minHeight: 90, border: "1px solid #CBD5E1", borderRadius: 10, padding: 12, font: "inherit", resize: "vertical" };
const decisionRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 };
const base: React.CSSProperties = { minHeight: 42, borderRadius: 999, padding: "0 14px", fontWeight: 900, cursor: "pointer" };
const approve: React.CSSProperties = { ...base, border: 0, background: "#047857", color: "#FFF" };
const secondary: React.CSSProperties = { ...base, border: "1px solid #CBD5E1", background: "#FFF", color: "#334155" };
const danger: React.CSSProperties = { ...base, border: 0, background: "#B91C1C", color: "#FFF" };
