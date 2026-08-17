"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  campaign_type: string;
  deliverables: string[];
  status: "draft" | "review_requested";
  updated_at: string;
};

type DraftEdit = { title: string; description: string; deliverables: string };

export default function BrandCampaignBuilderPage() {
  return <BrandPartnerVerificationGate><CampaignWorkspace /></BrandPartnerVerificationGate>;
}

function CampaignWorkspace() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, DraftEdit>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) { setError("Authentication required."); setLoading(false); return; }

    const organization = await supabase.rpc("ensure_brand_partner_organization");
    if (organization.error) { setError(organization.error.message); setLoading(false); return; }

    const [verification, drafts] = await Promise.all([
      supabase.from("brand_partner_verification_requests")
        .select("campaign_types")
        .eq("brand_user_id", auth.user.id)
        .eq("status", "approved")
        .eq("campaign_scope_approved", true)
        .eq("compliance_scope_approved", true)
        .order("reviewed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("brand_campaign_drafts")
        .select("id,title,description,campaign_type,deliverables,status,updated_at")
        .eq("brand_user_id", auth.user.id)
        .order("updated_at", { ascending: false }),
    ]);

    if (verification.error) { setError(verification.error.message); setLoading(false); return; }
    if (drafts.error) { setError(drafts.error.message); setLoading(false); return; }

    const types = Array.isArray(verification.data?.campaign_types) ? verification.data.campaign_types.map(String).filter(Boolean) : [];
    setAllowedTypes(types);
    setCampaignType((current) => current && types.includes(current) ? current : types[0] || "");
    const rows = (drafts.data || []) as Campaign[];
    setCampaigns(rows);
    setEdits(Object.fromEntries(rows.map((row) => [row.id, {
      title: row.title,
      description: row.description || "",
      deliverables: Array.isArray(row.deliverables) ? row.deliverables.join("\n") : "",
    }])));
    setLoading(false);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  function lines(value: string) { return value.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 50); }

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignType) { setError("No approved campaign type is available in your verification scope."); return; }
    setBusy("create"); setError(""); setMessage("");
    const result = await supabase.rpc("create_brand_campaign_draft", {
      requested_title: title.trim(),
      requested_description: description.trim() || null,
      requested_campaign_type: campaignType,
      requested_deliverables: lines(deliverables),
    });
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setTitle(""); setDescription(""); setDeliverables("");
    setMessage("Campaign draft created. It is not a published opportunity or compliance approval.");
    await load();
    setBusy("");
  }

  function patchEdit(id: string, patch: Partial<DraftEdit>) {
    setEdits((current) => ({ ...current, [id]: { ...(current[id] || { title: "", description: "", deliverables: "" }), ...patch } }));
  }

  async function saveCampaign(campaign: Campaign) {
    const edit = edits[campaign.id];
    if (!edit || campaign.status !== "draft") return;
    setBusy(campaign.id); setError(""); setMessage("");
    const result = await supabase.from("brand_campaign_drafts").update({
      title: edit.title.trim(),
      description: edit.description.trim() || null,
      deliverables: lines(edit.deliverables),
    }).eq("id", campaign.id).eq("status", "draft");
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage(`Draft saved: ${edit.title.trim() || campaign.title}.`);
    await load();
    setBusy("");
  }

  async function deleteCampaign(campaign: Campaign) {
    if (campaign.status !== "draft") return;
    setBusy(`delete:${campaign.id}`); setError(""); setMessage("");
    const result = await supabase.from("brand_campaign_drafts").delete().eq("id", campaign.id).eq("status", "draft");
    if (result.error) { setError(result.error.message); setBusy(""); return; }
    setMessage("Campaign draft deleted.");
    await load();
    setBusy("");
  }

  const draftCount = campaigns.filter((item) => item.status === "draft").length;
  const reviewCount = campaigns.filter((item) => item.status === "review_requested").length;

  return (
    <PlaybookPage>
      <div data-testid="brand-campaign-builder" data-visual-canon="PGBP-CAMPAIGN-001">
        <PlaybookHero eyebrow="Brand Partner Marketplace" title="Campaign Builder" subtitle="Build campaign drafts inside your verified scope. A draft is planning data—not a published opportunity, NIL deal, scholar selection, sponsorship commitment, or compliance clearance.">
          <div style={actions}><PlaybookButton href="/brand-partner-os">Brand Partner OS</PlaybookButton><PlaybookButton href="/brand-partner-os/organization" variant="secondary">Organization Profile</PlaybookButton></div>
        </PlaybookHero>

        {error ? <div role="alert" style={alert}>{error}</div> : null}
        {message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Campaign drafts" value={loading ? "…" : String(draftCount)} />
          <PlaybookMetric label="Review requested" value={loading ? "…" : String(reviewCount)} />
          <PlaybookMetric label="Approved campaign types" value={loading ? "…" : String(allowedTypes.length)} />
          <PlaybookMetric label="Published from drafts" value="0 by design" />
        </PlaybookMetrics>

        <section style={trustPanel}><PlaybookPill>Verified campaign scope</PlaybookPill><h2 style={trustTitle}>Campaign types cannot exceed approved verification evidence.</h2><p style={trustCopy}>The database validates every campaign insert and update against the organization, verification request, campaign scope, compliance scope, and approved campaign-type evidence—even if a client bypasses this screen.</p></section>

        <PlaybookCard eyebrow="New campaign draft" title="Start inside your approved scope">
          {allowedTypes.length === 0 && !loading ? <p style={copy}>No approved campaign types are available. Campaign creation remains blocked rather than inventing a scope.</p> : (
            <form onSubmit={createCampaign} style={form}>
              <label style={field}>Campaign title<input required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} style={input} /></label>
              <label style={field}>Approved campaign type<select required value={campaignType} onChange={(e) => setCampaignType(e.target.value)} style={input}>{allowedTypes.map((type) => <option key={type} value={type}>{label(type)}</option>)}</select></label>
              <label style={field}>Description<textarea maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} style={textarea} /></label>
              <label style={field}>Deliverables <span style={muted}>One deliverable per line. Drafts may be incomplete.</span><textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} style={textarea} /></label>
              <button type="submit" disabled={busy === "create" || !campaignType} style={primaryButton}>{busy === "create" ? "Creating…" : "Create campaign draft"}</button>
            </form>
          )}
        </PlaybookCard>

        {loading ? <div style={empty}>Loading governed campaign drafts…</div> : campaigns.length === 0 ? (
          <PlaybookCard eyebrow="Campaign Builder" title="No campaign drafts yet"><p style={copy}>Create the first real campaign draft above. Playbook does not seed sample brand campaigns.</p></PlaybookCard>
        ) : (
          <PlaybookGrid min={360}>{campaigns.map((campaign) => {
            const edit = edits[campaign.id] || { title: campaign.title, description: campaign.description || "", deliverables: "" };
            const editable = campaign.status === "draft";
            return <PlaybookCard key={campaign.id} eyebrow={`${label(campaign.campaign_type)} · ${label(campaign.status)}`} title={campaign.title}>
              <div style={form}>
                <label style={field}>Title<input disabled={!editable} value={edit.title} onChange={(e) => patchEdit(campaign.id, { title: e.target.value })} style={input} /></label>
                <label style={field}>Description<textarea disabled={!editable} value={edit.description} onChange={(e) => patchEdit(campaign.id, { description: e.target.value })} style={textarea} /></label>
                <label style={field}>Deliverables<textarea disabled={!editable} value={edit.deliverables} onChange={(e) => patchEdit(campaign.id, { deliverables: e.target.value })} style={textarea} /></label>
              </div>
              <p style={muted}>Updated {new Date(campaign.updated_at).toLocaleString()}</p>
              {editable ? <div style={actions}><button disabled={busy === campaign.id} onClick={() => void saveCampaign(campaign)} style={primaryButton}>{busy === campaign.id ? "Saving…" : "Save draft"}</button><button disabled={busy === `delete:${campaign.id}`} onClick={() => void deleteCampaign(campaign)} style={secondaryButton}>Delete draft</button></div> : <PlaybookPill>Editing locked after review request</PlaybookPill>}
            </PlaybookCard>;
          })}</PlaybookGrid>
        )}
      </div>
    </PlaybookPage>
  );
}

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
const actions: React.CSSProperties = { display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const muted: React.CSSProperties = { color: "#64748B", fontSize: 12, lineHeight: 1.5 };
const form: React.CSSProperties = { display: "grid", gap: 12 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, border: "1px solid #CBD5E1", borderRadius: 10, padding: "0 12px", font: "inherit", background: "#FFF" };
const textarea: React.CSSProperties = { ...input, minHeight: 92, padding: 12, resize: "vertical" };
const primaryButton: React.CSSProperties = { minHeight: 42, border: 0, borderRadius: 999, padding: "0 15px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#FFF", color: "#334155", border: "1px solid #CBD5E1" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
