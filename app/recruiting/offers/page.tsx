"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaybookButton, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type Target = { id: string; school_name: string; athletic_program: string | null };
type Evidence = { id: string; metric_name: string; verification_state: string; observed_at: string };
type OfferKind = "verbal" | "written" | "athletic_aid" | "roster_opportunity" | "walk_on" | "other";
type OfferStatus = "received" | "considering" | "accepted" | "declined" | "withdrawn";
type Offer = {
  id: string;
  recruiting_target_id: string;
  offer_kind: OfferKind;
  offer_status: OfferStatus;
  offered_at: string;
  terms_summary: string | null;
  source_label: string | null;
  source_url: string | null;
  athlete_evidence_id: string | null;
  verification_state: string;
  supersedes_offer_id: string | null;
  recruiting_targets: { school_name: string; athletic_program: string | null } | null;
  athlete_evidence: { metric_name: string; verification_state: string } | null;
};

const kinds: OfferKind[] = ["verbal", "written", "athletic_aid", "roster_opportunity", "walk_on", "other"];
const offerStatuses: OfferStatus[] = ["received", "considering", "accepted", "declined", "withdrawn"];

export default function RecruitingOffersPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState("");
  const [targets, setTargets] = useState<Target[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [targetId, setTargetId] = useState("");
  const [kind, setKind] = useState<OfferKind>("verbal");
  const [offerStatus, setOfferStatus] = useState<OfferStatus>("received");
  const [offeredAt, setOfferedAt] = useState("");
  const [terms, setTerms] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [supersedesId, setSupersedesId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadWorkspace(userId: string) {
    const [targetResult, offerResult, evidenceResult] = await Promise.all([
      supabase.from("recruiting_targets").select("id,school_name,athletic_program").eq("scholar_id", userId).order("school_name"),
      supabase.from("recruiting_offers").select("id,recruiting_target_id,offer_kind,offer_status,offered_at,terms_summary,source_label,source_url,athlete_evidence_id,verification_state,supersedes_offer_id,recruiting_targets(school_name,athletic_program),athlete_evidence(metric_name,verification_state)").eq("scholar_id", userId).order("offered_at", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("athlete_evidence").select("id,metric_name,verification_state,observed_at").eq("scholar_id", userId).order("observed_at", { ascending: false }),
    ]);
    const firstError = targetResult.error || offerResult.error || evidenceResult.error;
    if (firstError) throw firstError;
    const loadedTargets = (targetResult.data || []) as Target[];
    setTargets(loadedTargets);
    setOffers((offerResult.data || []) as unknown as Offer[]);
    setEvidence((evidenceResult.data || []) as Evidence[]);
    setTargetId((current) => current || loadedTargets[0]?.id || "");
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/recruiting/offers");
        return;
      }
      setOwnerId(auth.user.id);
      try { await loadWorkspace(auth.user.id); }
      catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Recruiting offers could not be loaded."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  async function addOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId || !targetId || !offeredAt) return;

    let normalizedUrl: string | null = null;
    if (sourceUrl.trim()) {
      try {
        const parsed = new URL(sourceUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol");
        normalizedUrl = parsed.toString();
      } catch {
        setError("Source URL must be a valid http or https URL.");
        return;
      }
    }

    const prior = supersedesId ? offers.find((offer) => offer.id === supersedesId) : null;
    if (prior && prior.recruiting_target_id !== targetId) {
      setError("A correction must refer to an earlier offer from the same recruiting target.");
      return;
    }

    setSaving(true); setError(""); setMessage("");
    const { error: insertError } = await supabase.from("recruiting_offers").insert({
      scholar_id: ownerId,
      recruiting_target_id: targetId,
      offer_kind: kind,
      offer_status: offerStatus,
      offered_at: offeredAt,
      terms_summary: terms.trim() || null,
      source_label: sourceLabel.trim() || null,
      source_url: normalizedUrl,
      athlete_evidence_id: evidenceId || null,
      supersedes_offer_id: supersedesId || null,
      verification_state: "self_reported",
      provenance: { entry_surface: "recruiting/offers" },
    });
    if (insertError) { setError(insertError.message); setSaving(false); return; }
    try {
      await loadWorkspace(ownerId);
      setTerms(""); setSourceLabel(""); setSourceUrl(""); setEvidenceId(""); setSupersedesId(""); setOfferedAt("");
      setMessage("Offer claim added as self-reported evidence. Earlier records remain preserved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Offer saved, but the workspace could not refresh.");
    } finally { setSaving(false); }
  }

  if (loading) return <PlaybookPage><div style={state}>Connecting your recruiting offer evidence…</div></PlaybookPage>;

  const activeOffers = offers.filter((offer) => ["received", "considering", "accepted"].includes(offer.offer_status)).length;
  const linkedEvidence = offers.filter((offer) => Boolean(offer.athlete_evidence_id)).length;
  const verifiedLinkedEvidence = offers.filter((offer) => offer.athlete_evidence?.verification_state === "verified").length;

  return (
    <PlaybookPage>
      <div data-testid="recruiting-offers" data-visual-canon="PGRO-001">
        <PlaybookHero eyebrow="Recruiting Offers" title="Record the offer without overstating what is verified." subtitle="Preserve what you were told, the source you have, and your current response. A Scholar-entered offer is a claim in your private record—not proof of coach authority, admissions, financial aid, eligibility, or a roster guarantee." >
          <div style={actions}><PlaybookButton href="/recruiting">Recruiting Command Center</PlaybookButton><PlaybookButton href="/recruiting/visits" variant="secondary">Visits</PlaybookButton><PlaybookButton href="/recruiting/evidence" variant="secondary">Athletic Evidence</PlaybookButton></div>
        </PlaybookHero>
        {error ? <div role="alert" style={errorBox}>{error}</div> : null}
        {message ? <div role="status" style={successBox}>{message}</div> : null}
        <PlaybookMetrics><PlaybookMetric label="Offer records" value={String(offers.length)} /><PlaybookMetric label="Current / active" value={String(activeOffers)} /><PlaybookMetric label="Evidence linked" value={String(linkedEvidence)} /><PlaybookMetric label="Linked evidence verified" value={String(verifiedLinkedEvidence)} /></PlaybookMetrics>

        <section style={trustPanel}><PlaybookPill>Evidence boundary</PlaybookPill><h2 style={trustTitle}>Self-reported offer ≠ independently verified offer.</h2><p style={trustCopy}>Linking a verified Athletic Evidence record strengthens provenance for that evidence item only. It does not automatically verify the recruiting offer claim. Playbook keeps those truths separate.</p></section>

        <div style={grid}>
          <section style={panel}>
            <PlaybookPill>Append-only offer record</PlaybookPill><h2 style={heading}>Add an offer claim or correction</h2>
            {targets.length === 0 ? <div style={empty}><strong>Add a recruiting target first.</strong><p style={muted}>Every offer record must belong to a real school/program in your Recruiting Command Center.</p><PlaybookButton href="/recruiting">Add a target</PlaybookButton></div> : (
              <form onSubmit={addOffer} style={form}>
                <label style={field}>School / program<select value={targetId} onChange={(e) => { setTargetId(e.target.value); setSupersedesId(""); }} style={input}>{targets.map((target) => <option key={target.id} value={target.id}>{target.school_name}{target.athletic_program ? ` · ${target.athletic_program}` : ""}</option>)}</select></label>
                <label style={field}>Offer type<select value={kind} onChange={(e) => setKind(e.target.value as OfferKind)} style={input}>{kinds.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label>
                <label style={field}>Current status<select value={offerStatus} onChange={(e) => setOfferStatus(e.target.value as OfferStatus)} style={input}>{offerStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label>
                <label style={field}>Offer / communication date<input required type="date" value={offeredAt} onChange={(e) => setOfferedAt(e.target.value)} style={input} /></label>
                <label style={field}>Terms summary<textarea value={terms} onChange={(e) => setTerms(e.target.value)} maxLength={4000} style={textarea} placeholder="Record only terms that were actually communicated. Avoid assumptions." /></label>
                <label style={field}>Source label<input value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} style={input} placeholder="Coach email, letter, portal message…" /></label>
                <label style={field}>Source URL<input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={input} placeholder="https://…" /></label>
                <label style={field}>Link Athletic Evidence<select value={evidenceId} onChange={(e) => setEvidenceId(e.target.value)} style={input}><option value="">No linked evidence</option>{evidence.map((item) => <option key={item.id} value={item.id}>{label(item.verification_state)} · {item.metric_name} · {item.observed_at}</option>)}</select><span style={helper}>A verified evidence link does not verify the offer itself.</span></label>
                <label style={field}>Correction / supersedes<select value={supersedesId} onChange={(e) => setSupersedesId(e.target.value)} style={input}><option value="">New offer record</option>{offers.filter((offer) => offer.recruiting_target_id === targetId).map((offer) => <option key={offer.id} value={offer.id}>{offer.offered_at} · {label(offer.offer_kind)} · {label(offer.offer_status)}</option>)}</select><span style={helper}>Use a correction instead of editing or deleting earlier offer history.</span></label>
                <button disabled={saving} style={primary}>{saving ? "Saving evidence…" : "Add offer record"}</button>
              </form>
            )}
          </section>

          <section style={panel}>
            <PlaybookPill>Offer history</PlaybookPill><h2 style={heading}>What your record actually contains</h2>
            {offers.length === 0 ? <div style={empty}><strong>No offers recorded.</strong><p style={muted}>Playbook will not fabricate scholarship offers, roster spots, coach interest, or financial terms.</p></div> : <div style={list}>{offers.map((offer) => (
              <article key={offer.id} style={card}>
                <div style={cardTop}><div><span style={eyebrow}>{label(offer.offer_kind)}</span><h3 style={cardTitle}>{offer.recruiting_targets?.school_name || "Recruiting target"}</h3><p style={muted}>{offer.offered_at} · {label(offer.offer_status)}</p></div><span style={selfBadge}>{label(offer.verification_state)}</span></div>
                {offer.terms_summary ? <p style={termsCopy}>{offer.terms_summary}</p> : null}
                <div style={details}><div><span style={detailLabel}>Source</span><strong>{offer.source_label || "Not recorded"}</strong></div><div><span style={detailLabel}>Linked evidence</span><strong>{offer.athlete_evidence ? `${offer.athlete_evidence.metric_name} · ${label(offer.athlete_evidence.verification_state)}` : "None"}</strong></div></div>
                {offer.source_url ? <a href={offer.source_url} target="_blank" rel="noreferrer" style={link}>Open source →</a> : null}
                {offer.supersedes_offer_id ? <p style={correction}>Correction record · earlier offer preserved</p> : null}
              </article>
            ))}</div>}
          </section>
        </div>
      </div>
    </PlaybookPage>
  );
}

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
const state: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#64748B" };
const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 };
const errorBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const successBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(25px,4vw,36px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { padding: "clamp(20px,3vw,30px)", border: "1px solid #DDE6EF", borderRadius: 24, background: "#FFF" };
const heading: React.CSSProperties = { margin: "10px 0 12px", color: "#102238", fontSize: "clamp(26px,4vw,36px)" };
const form: React.CSSProperties = { display: "grid", gap: 13 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontSize: 12, fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #CBD5E1", padding: "9px 11px", font: "inherit" };
const textarea: React.CSSProperties = { ...input, minHeight: 100, resize: "vertical" };
const helper: React.CSSProperties = { color: "#64748B", fontSize: 11, fontWeight: 600 };
const primary: React.CSSProperties = { minHeight: 46, border: 0, borderRadius: 999, background: "#F97316", color: "#FFF", fontWeight: 900 };
const empty: React.CSSProperties = { padding: 20, borderRadius: 16, background: "#F8FAFC", border: "1px dashed #CBD5E1" };
const muted: React.CSSProperties = { color: "#64748B", lineHeight: 1.55 };
const list: React.CSSProperties = { display: "grid", gap: 12 };
const card: React.CSSProperties = { padding: 17, borderRadius: 18, border: "1px solid #E2E8F0", background: "#FBFCFE" };
const cardTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" };
const eyebrow: React.CSSProperties = { color: "#C2410C", fontSize: 10, fontWeight: 950, letterSpacing: ".08em", textTransform: "uppercase" };
const cardTitle: React.CSSProperties = { margin: "5px 0", color: "#102238", fontSize: 21 };
const selfBadge: React.CSSProperties = { alignSelf: "start", padding: "6px 9px", borderRadius: 999, background: "#FFF7ED", color: "#C2410C", fontSize: 10, fontWeight: 950, textTransform: "uppercase" };
const termsCopy: React.CSSProperties = { padding: 12, borderRadius: 12, background: "#F8FAFC", color: "#475569", lineHeight: 1.6 };
const details: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 12 };
const detailLabel: React.CSSProperties = { display: "block", color: "#94A3B8", fontSize: 9, fontWeight: 950, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 };
const link: React.CSSProperties = { display: "inline-flex", marginTop: 12, color: "#C2410C", fontWeight: 900, textDecoration: "none" };
const correction: React.CSSProperties = { marginBottom: 0, color: "#64748B", fontSize: 11, fontWeight: 750 };
