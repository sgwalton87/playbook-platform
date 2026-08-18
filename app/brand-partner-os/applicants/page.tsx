"use client";

import { useCallback, useEffect, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Applicant = {
  share_id: string;
  workspace_id: string;
  opportunity_id: string;
  opportunity_title: string;
  opportunity_type: string;
  applicant_name: string;
  application_status: string;
  outcome_status: string;
  shared_at: string;
  outcome_updated_at: string;
};

export default function BrandPartnerApplicantsPage() {
  return <BrandPartnerVerificationGate><ApplicantWorkspace /></BrandPartnerVerificationGate>;
}

function ApplicantWorkspace() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const result = await supabase.rpc("get_marketplace_applicants");
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    setApplicants((result.data || []) as Applicant[]);
    setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function setOutcome(applicant: Applicant, status: "under_review" | "selected" | "not_selected") {
    setBusy(`${applicant.share_id}:${status}`); setError(""); setMessage("");
    const result = await supabase.rpc("set_marketplace_applicant_outcome", {
      requested_share_id: applicant.share_id,
      requested_status: status,
      requested_note: notes[applicant.share_id]?.trim() || null,
    });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage(`${applicant.applicant_name}: ${status.replaceAll("_", " ")} recorded.`);
    await load(); setBusy("");
  }

  const underReview = applicants.filter((row) => row.outcome_status === "under_review").length;
  const selected = applicants.filter((row) => row.outcome_status === "selected").length;

  return <PlaybookPage>
    <div data-testid="marketplace-applicants" data-visual-canon="PGBP-APPLICANTS-001">
      <PlaybookHero eyebrow="Brand Partner Marketplace" title="Opportunity Applicants" subtitle="Review only applications that Scholars explicitly chose to share after submission. Consent is revocable; private Application Workspace documents and the broader Scholar Record remain outside Brand Partner authority.">
        <div style={actions}><PlaybookButton href="/brand-partner-os">Brand Partner OS</PlaybookButton><PlaybookButton href="/brand-partner-os/opportunities" variant="secondary">Opportunity Listings</PlaybookButton></div>
      </PlaybookHero>
      <PlaybookMetrics>
        <PlaybookMetric label="Consented applicants" value={loading ? "…" : String(applicants.length)} />
        <PlaybookMetric label="Under review" value={loading ? "…" : String(underReview)} />
        <PlaybookMetric label="Selected" value={loading ? "…" : String(selected)} />
        <PlaybookMetric label="Record access" value="Projection only" />
      </PlaybookMetrics>

      <section style={trustPanel}><PlaybookPill>Explicit Scholar consent</PlaybookPill><h2 style={trustTitle}>Publishing an opportunity never exposes applicants automatically.</h2><p style={trustCopy}>This workspace receives a narrow projection only after a Scholar submits an Application Workspace and explicitly shares it. Revocation removes the applicant from this view. No transcript, private document, support relationship, contact record, or unrelated Scholar Record field is exposed.</p></section>
      {error ? <div role="alert" style={alert}>{error}</div> : null}{message ? <div role="status" aria-live="polite" style={statusBox}>{message}</div> : null}

      {loading ? <div style={empty}>Loading consented applicants…</div> : applicants.length === 0 ? <PlaybookCard eyebrow="Applicants" title="No Scholars have shared a submitted application"><p style={copy}>The empty state is intentional. Playbook does not infer applicant consent from an opportunity view, save, RSVP, or application draft.</p></PlaybookCard> : <PlaybookGrid min={360}>{applicants.map((applicant) => <PlaybookCard key={applicant.share_id} eyebrow={`${label(applicant.opportunity_type)} · ${label(applicant.outcome_status)}`} title={applicant.applicant_name}>
        <p style={copy}><strong>Opportunity:</strong> {applicant.opportunity_title}</p>
        <p style={copy}><strong>Application status:</strong> {label(applicant.application_status)}</p>
        <p style={muted}>Shared {new Date(applicant.shared_at).toLocaleString()}</p>
        <div style={pillRow}><PlaybookPill>{label(applicant.outcome_status)}</PlaybookPill><PlaybookPill>Scholar consent active</PlaybookPill></div>
        <label style={field}>Decision note<textarea value={notes[applicant.share_id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [applicant.share_id]: event.target.value }))} maxLength={2000} style={textarea} placeholder="Optional internal context for this human-recorded outcome." /></label>
        <div style={actions}><button disabled={busy.startsWith(applicant.share_id)} onClick={() => void setOutcome(applicant,"under_review")} style={secondary}>Under review</button><button disabled={busy.startsWith(applicant.share_id)} onClick={() => void setOutcome(applicant,"selected")} style={approve}>Selected</button><button disabled={busy.startsWith(applicant.share_id)} onClick={() => void setOutcome(applicant,"not_selected")} style={danger}>Not selected</button></div>
      </PlaybookCard>)}</PlaybookGrid>}
    </div>
  </PlaybookPage>;
}

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
const actions: React.CSSProperties = { display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const statusBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const muted: React.CSSProperties = { color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontWeight: 850 };
const textarea: React.CSSProperties = { minHeight: 80, border: "1px solid #CBD5E1", borderRadius: 10, padding: 12, font: "inherit", resize: "vertical" };
const base: React.CSSProperties = { minHeight: 42, borderRadius: 999, padding: "0 14px", fontWeight: 900, cursor: "pointer" };
const approve: React.CSSProperties = { ...base, border: 0, background: "#047857", color: "#FFF" };
const secondary: React.CSSProperties = { ...base, border: "1px solid #CBD5E1", background: "#FFF", color: "#334155" };
const danger: React.CSSProperties = { ...base, border: 0, background: "#B91C1C", color: "#FFF" };