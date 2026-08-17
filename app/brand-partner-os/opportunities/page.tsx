"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type OpportunityType = "internship" | "job" | "sponsorship" | "nil" | "scholarship" | "mentorship";
type Listing = {
  id: string;
  opportunity_type: OpportunityType;
  title: string;
  description: string;
  location: string | null;
  external_url: string | null;
  deadline: string | null;
  compensation_summary: string | null;
  eligibility: string[];
  requirements: string[];
  tags: string[];
  status: "draft" | "review_requested" | "changes_requested" | "published" | "rejected" | "closed";
  review_notes: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  updated_at: string;
};

const TYPES: OpportunityType[] = ["internship", "job", "sponsorship", "nil", "scholarship", "mentorship"];

export default function BrandOpportunityManagerPage() {
  return <BrandPartnerVerificationGate><BrandOpportunityWorkspace /></BrandPartnerVerificationGate>;
}

function BrandOpportunityWorkspace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [type, setType] = useState<OpportunityType>("internship");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [compensation, setCompensation] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [requirements, setRequirements] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const result = await supabase.rpc("get_own_marketplace_opportunities");
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    setListings((result.data || []) as Listing[]);
    setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  function lines(value: string) { return value.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 30); }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("create"); setError(""); setMessage("");
    const result = await supabase.rpc("create_marketplace_opportunity", {
      requested_type: type,
      requested_title: title.trim(),
      requested_description: description.trim(),
      requested_location: location.trim() || null,
      requested_external_url: url.trim() || null,
      requested_deadline: deadline || null,
      requested_compensation_summary: compensation.trim() || null,
      requested_eligibility: lines(eligibility),
      requested_requirements: lines(requirements),
      requested_tags: lines(tags),
      requested_campaign_id: null,
    });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setTitle(""); setDescription(""); setLocation(""); setUrl(""); setDeadline(""); setCompensation(""); setEligibility(""); setRequirements(""); setTags("");
    setMessage("Opportunity draft created. It is not published and is not visible to Scholars until human review approves it.");
    await load(); setBusy("");
  }

  async function submit(listing: Listing) {
    setBusy(listing.id); setError(""); setMessage("");
    const result = await supabase.rpc("submit_marketplace_opportunity_for_review", { requested_opportunity_id: listing.id });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage(`${listing.title} was submitted for human publication review.`); await load(); setBusy("");
  }

  const drafts = listings.filter((item) => item.status === "draft" || item.status === "changes_requested").length;
  const inReview = listings.filter((item) => item.status === "review_requested").length;
  const published = listings.filter((item) => item.status === "published").length;

  return <PlaybookPage>
    <div data-testid="brand-marketplace-opportunities" data-visual-canon="PGBP-OPP-001">
      <PlaybookHero eyebrow="Brand Partner Marketplace" title="Opportunity Listings" subtitle="Create real internships, jobs, sponsorships, NIL opportunities, scholarships, and mentorship listings. Drafts stay private until a Playbook operator completes human publication review.">
        <div style={actions}><PlaybookButton href="/brand-partner-os">Brand Partner OS</PlaybookButton><PlaybookButton href="/brand-partner-os/campaigns" variant="secondary">Campaign Builder</PlaybookButton></div>
      </PlaybookHero>
      <PlaybookMetrics>
        <PlaybookMetric label="Listings" value={loading ? "…" : String(listings.length)} />
        <PlaybookMetric label="Draft / changes" value={loading ? "…" : String(drafts)} />
        <PlaybookMetric label="In human review" value={loading ? "…" : String(inReview)} />
        <PlaybookMetric label="Published" value={loading ? "…" : String(published)} />
      </PlaybookMetrics>

      <section style={trustPanel}><PlaybookPill>Human publication authority</PlaybookPill><h2 style={trustTitle}>A draft is not an opportunity until it is reviewed and published.</h2><p style={trustCopy}>Campaign approval, NIL readiness, and partner verification do not automatically publish a listing. Playbook separates organization verification, campaign planning, opportunity publication, Scholar applications, and consequential selection decisions.</p></section>

      {error ? <div role="alert" style={alert}>{error}</div> : null}
      {message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}

      <PlaybookCard eyebrow="New listing" title="Create a governed Marketplace draft">
        <form onSubmit={create} style={form}>
          <label style={field}>Opportunity type<select value={type} onChange={(e) => setType(e.target.value as OpportunityType)} style={input}>{TYPES.map((value) => <option key={value} value={value}>{labelType(value)}</option>)}</select></label>
          <label style={field}>Title<input required minLength={3} maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} style={input} /></label>
          <label style={field}>Description<textarea required minLength={20} maxLength={8000} value={description} onChange={(e) => setDescription(e.target.value)} style={textarea} /></label>
          <div style={twoCol}><label style={field}>Location<input maxLength={240} value={location} onChange={(e) => setLocation(e.target.value)} style={input} placeholder="Oakland, CA · Remote · Hybrid" /></label><label style={field}>Deadline<input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={input} /></label></div>
          <label style={field}>External information/application URL<input type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={input} placeholder="https://…" /></label>
          <label style={field}>Compensation / award summary<textarea maxLength={1000} value={compensation} onChange={(e) => setCompensation(e.target.value)} style={textarea} placeholder="Describe disclosed compensation, award, stipend, or unpaid status without guaranteeing an outcome." /></label>
          <div style={threeCol}><label style={field}>Eligibility <span style={muted}>One item per line.</span><textarea value={eligibility} onChange={(e) => setEligibility(e.target.value)} style={textarea} /></label><label style={field}>Requirements <span style={muted}>One item per line.</span><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} style={textarea} /></label><label style={field}>Tags <span style={muted}>One item per line.</span><textarea value={tags} onChange={(e) => setTags(e.target.value)} style={textarea} /></label></div>
          <button type="submit" disabled={busy === "create"} style={primaryButton}>{busy === "create" ? "Creating…" : "Create private draft"}</button>
        </form>
      </PlaybookCard>

      {loading ? <div style={empty}>Loading Marketplace listings…</div> : listings.length === 0 ? <PlaybookCard eyebrow="Opportunity listings" title="No listings yet"><p style={copy}>Create the first real listing above. Playbook does not fabricate Marketplace opportunities for an empty state.</p></PlaybookCard> : <PlaybookGrid min={340}>
        {listings.map((listing) => <PlaybookCard key={listing.id} eyebrow={labelType(listing.opportunity_type)} title={listing.title}>
          <div style={pillRow}><PlaybookPill>{listing.status.replaceAll("_", " ")}</PlaybookPill>{listing.deadline ? <PlaybookPill>Deadline {listing.deadline}</PlaybookPill> : null}</div>
          <p style={copy}>{listing.description}</p>
          {listing.review_notes ? <div style={reviewNote}><strong>Reviewer note</strong><p>{listing.review_notes}</p></div> : null}
          <p style={muted}>Updated {new Date(listing.updated_at).toLocaleString()}</p>
          {(listing.status === "draft" || listing.status === "changes_requested") ? <button type="button" disabled={busy === listing.id} onClick={() => void submit(listing)} style={primaryButton}>{busy === listing.id ? "Submitting…" : "Request publication review"}</button> : null}
        </PlaybookCard>)}
      </PlaybookGrid>}
    </div>
  </PlaybookPage>;
}

function labelType(value: OpportunityType) { if (value === "nil") return "NIL Opportunity"; return value[0].toUpperCase() + value.slice(1); }
const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const form: React.CSSProperties = { display: "grid", gap: 14 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, border: "1px solid #CBD5E1", borderRadius: 10, padding: "0 12px", font: "inherit", background: "#FFF" };
const textarea: React.CSSProperties = { ...input, minHeight: 100, padding: 12, resize: "vertical" };
const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 };
const threeCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const muted: React.CSSProperties = { color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const primaryButton: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 999, padding: "0 16px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 };
const reviewNote: React.CSSProperties = { padding: 12, borderRadius: 12, background: "#FFF7ED", color: "#9A3412" };
