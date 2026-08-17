"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Partner = {
  id: string;
  partner_key: string;
  name: string;
  category: string;
  active: boolean;
  summary: string | null;
  website_url: string | null;
  logo_url: string | null;
  location: string | null;
  partnership_focus: string[];
  updated_at: string;
};

function firstPartner(value: unknown): Partner | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  return row as Partner;
}

export default function BrandOrganizationPage() {
  return <BrandPartnerVerificationGate><OrganizationWorkspace /></BrandPartnerVerificationGate>;
}

function OrganizationWorkspace() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [summary, setSummary] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [location, setLocation] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const result = await supabase.rpc("ensure_brand_partner_organization");
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    const row = firstPartner(result.data);
    if (!row) { setError("Verified organization could not be resolved."); setLoading(false); return; }
    setPartner(row);
    setSummary(row.summary || "");
    setWebsite(row.website_url || "");
    setLogo(row.logo_url || "");
    setLocation(row.location || "");
    setFocus(Array.isArray(row.partnership_focus) ? row.partnership_focus.join("\n") : "");
    setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    const partnershipFocus = focus.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 20);
    const result = await supabase.rpc("update_brand_partner_organization", {
      requested_summary: summary.trim() || null,
      requested_website_url: website.trim() || null,
      requested_logo_url: logo.trim() || null,
      requested_location: location.trim() || null,
      requested_partnership_focus: partnershipFocus,
    });
    if (result.error) { setError(result.error.message); setSaving(false); return; }
    setMessage("Organization Profile updated. Verification evidence and approval scopes were not changed.");
    await load();
    setSaving(false);
  }

  if (loading) return <PlaybookPage><div style={state}>Connecting your verified Organization Profile…</div></PlaybookPage>;

  return (
    <PlaybookPage>
      <div data-testid="brand-organization-profile" data-visual-canon="PGBP-ORG-001">
        <PlaybookHero eyebrow="Brand Partner Marketplace" title="Organization Profile" subtitle="Maintain the operational organization profile that Marketplace campaigns reference. Verification evidence stays preserved separately and cannot be rewritten here.">
          <div style={actions}><PlaybookButton href="/brand-partner-os">Brand Partner OS</PlaybookButton><PlaybookButton href="/brand-partner-os/campaigns" variant="secondary">Campaign Builder</PlaybookButton></div>
        </PlaybookHero>
        {error ? <div role="alert" style={alert}>{error}</div> : null}
        {message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Organization" value={partner?.name || "Not resolved"} />
          <PlaybookMetric label="Category" value={partner?.category || "Not set"} />
          <PlaybookMetric label="Marketplace status" value={partner?.active ? "Active" : "Inactive"} />
          <PlaybookMetric label="Profile key" value={partner?.partner_key || "—"} />
        </PlaybookMetrics>

        <section style={trustPanel}><PlaybookPill>Canonical ownership</PlaybookPill><h2 style={trustTitle}>Profile edits do not rewrite verification.</h2><p style={trustCopy}>Organization identity is materialized only after independent Brand Partner verification approves both campaign and compliance scope. This screen extends the operational organization record with marketplace-facing context.</p></section>

        <PlaybookGrid min={340}>
          <PlaybookCard eyebrow="Verified identity" title={partner?.name || "Organization"}>
            <p style={copy}>Category: <strong>{partner?.category || "Not set"}</strong></p>
            <p style={copy}>Status: <strong>{partner?.active ? "Active" : "Inactive"}</strong></p>
            <p style={muted}>Name/category originate from approved verification evidence and are refreshed by the governed organization bootstrap.</p>
          </PlaybookCard>

          <PlaybookCard eyebrow="Marketplace profile" title="Tell scholars what your organization supports">
            <form onSubmit={save} style={form}>
              <label style={field}>Organization summary<textarea maxLength={2000} value={summary} onChange={(e) => setSummary(e.target.value)} style={textarea} placeholder="Mission, community focus, and how you support scholars…" /></label>
              <label style={field}>Website URL<input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} style={input} placeholder="https://…" /></label>
              <label style={field}>Logo URL<input type="url" value={logo} onChange={(e) => setLogo(e.target.value)} style={input} placeholder="https://…" /></label>
              <label style={field}>Location<input maxLength={240} value={location} onChange={(e) => setLocation(e.target.value)} style={input} placeholder="Oakland, CA or Remote" /></label>
              <label style={field}>Partnership focus <span style={muted}>One focus area per line.</span><textarea value={focus} onChange={(e) => setFocus(e.target.value)} style={textarea} placeholder={"Internships\nFinancial literacy\nScholar-athlete development"} /></label>
              <button type="submit" disabled={saving} style={primaryButton}>{saving ? "Saving…" : "Save Organization Profile"}</button>
            </form>
          </PlaybookCard>
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const state: React.CSSProperties = { maxWidth: 1180, minHeight: 320, margin: "30px auto", display: "grid", placeItems: "center", color: "#64748B" };
const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const muted: React.CSSProperties = { color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const form: React.CSSProperties = { display: "grid", gap: 12 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, border: "1px solid #CBD5E1", borderRadius: 10, padding: "0 12px", font: "inherit" };
const textarea: React.CSSProperties = { ...input, minHeight: 100, padding: 12, resize: "vertical" };
const primaryButton: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 999, padding: "0 16px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
