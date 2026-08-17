"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type EvidenceCategory = "measurement" | "statistic" | "competition_result" | "award" | "film" | "other";
type SourceType = "self_reported" | "document" | "link" | "coach" | "official_result" | "third_party" | "other";

type AthleteEvidenceRow = {
  id: string;
  scholar_id: string;
  sport: string;
  category: EvidenceCategory;
  metric_name: string;
  value_text: string | null;
  value_numeric: number | null;
  unit: string | null;
  observed_at: string;
  source_type: SourceType;
  source_label: string | null;
  source_url: string | null;
  verification_state: "self_reported" | "submitted" | "verified" | "rejected" | "superseded";
  supersedes_evidence_id: string | null;
  created_at: string;
};

const categories: Array<{ value: EvidenceCategory; label: string }> = [
  { value: "measurement", label: "Measurement" },
  { value: "statistic", label: "Statistic" },
  { value: "competition_result", label: "Competition result" },
  { value: "award", label: "Award / recognition" },
  { value: "film", label: "Film evidence" },
  { value: "other", label: "Other evidence" },
];

const sourceTypes: Array<{ value: SourceType; label: string }> = [
  { value: "self_reported", label: "Self reported" },
  { value: "document", label: "Document" },
  { value: "link", label: "Link" },
  { value: "coach", label: "Coach-provided source" },
  { value: "official_result", label: "Official result source" },
  { value: "third_party", label: "Third-party source" },
  { value: "other", label: "Other source" },
];

export default function AthleticEvidencePage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [rows, setRows] = useState<AthleteEvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingId, setRequestingId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [sport, setSport] = useState("");
  const [category, setCategory] = useState<EvidenceCategory>("measurement");
  const [metricName, setMetricName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("self_reported");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [supersedesId, setSupersedesId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvidence() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }

      setOwnerId(auth.user.id);

      const [{ data: evidence, error: evidenceError }, { data: athleteProfile }] = await Promise.all([
        supabase
          .from("athlete_evidence")
          .select("id,scholar_id,sport,category,metric_name,value_text,value_numeric,unit,observed_at,source_type,source_label,source_url,verification_state,supersedes_evidence_id,created_at")
          .eq("scholar_id", auth.user.id)
          .order("observed_at", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("athlete_profiles")
          .select("sport")
          .eq("scholar_id", auth.user.id)
          .maybeSingle(),
      ]);

      if (!active) return;
      if (evidenceError) {
        setError(evidenceError.message);
        setLoading(false);
        return;
      }

      setRows((evidence || []) as AthleteEvidenceRow[]);
      const profileSport = (athleteProfile as { sport?: string } | null)?.sport;
      if (profileSport) setSport(profileSport);
      setLoading(false);
    }

    void loadEvidence();
    return () => { active = false; };
  }, [router]);

  const summary = useMemo(() => {
    const verified = rows.filter((row) => row.verification_state === "verified").length;
    const selfReported = rows.filter((row) => row.verification_state === "self_reported").length;
    const submitted = rows.filter((row) => row.verification_state === "submitted").length;
    return { total: rows.length, verified, selfReported, submitted };
  }, [rows]);

  async function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId) return;

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError("Enter the measurement, statistic, result, or evidence value.");
      return;
    }
    if (!observedAt) {
      setError("Choose when this evidence was observed or earned.");
      return;
    }

    let normalizedSourceUrl: string | null = null;
    if (sourceUrl.trim()) {
      try {
        const parsed = new URL(sourceUrl.trim());
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol");
        normalizedSourceUrl = parsed.toString();
      } catch {
        setError("Source URL must be a valid http or https URL.");
        return;
      }
    }

    const numericCandidate = Number(trimmedValue);
    const isNumeric = Number.isFinite(numericCandidate) && /^[-+]?\d*\.?\d+$/.test(trimmedValue);

    setSaving(true);
    setError(null);
    setMessage(null);

    const { data, error: insertError } = await supabase
      .from("athlete_evidence")
      .insert({
        scholar_id: ownerId,
        sport: sport.trim(),
        category,
        metric_name: metricName.trim(),
        value_text: isNumeric ? null : trimmedValue,
        value_numeric: isNumeric ? numericCandidate : null,
        unit: unit.trim() || null,
        observed_at: observedAt,
        source_type: sourceType,
        source_label: sourceLabel.trim() || null,
        source_url: normalizedSourceUrl,
        supersedes_evidence_id: supersedesId || null,
        verification_state: "self_reported",
        provenance: { entry_surface: "recruiting/evidence" },
      })
      .select("id,scholar_id,sport,category,metric_name,value_text,value_numeric,unit,observed_at,source_type,source_label,source_url,verification_state,supersedes_evidence_id,created_at")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Athletic evidence could not be saved.");
      setSaving(false);
      return;
    }

    setRows((current) => [data as AthleteEvidenceRow, ...current]);
    setMetricName("");
    setValue("");
    setUnit("");
    setObservedAt("");
    setSourceType("self_reported");
    setSourceLabel("");
    setSourceUrl("");
    setSupersedesId("");
    setMessage("Evidence added to your private athletic record as self-reported evidence.");
    setSaving(false);
  }

  async function requestVerification(row: AthleteEvidenceRow) {
    if (row.verification_state !== "self_reported") return;
    setRequestingId(row.id);
    setError(null);
    setMessage(null);

    const { error: requestError } = await supabase.rpc("request_athlete_evidence_verification", {
      requested_evidence_id: row.id,
    });

    if (requestError) {
      setError(requestError.message);
      setRequestingId("");
      return;
    }

    setRows((current) => current.map((item) => item.id === row.id ? { ...item, verification_state: "submitted" } : item));
    setMessage(`${row.metric_name} was submitted for independent verification review.`);
    setRequestingId("");
  }

  if (loading) {
    return <PlaybookPage><div data-testid="athletic-evidence-ledger" style={loadingState}>Connecting your athletic evidence record…</div></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="athletic-evidence-ledger" data-visual-canon="PGAE-001">
        <PlaybookHero
          eyebrow="Athletic Evidence Ledger"
          title="Build a record that can show its work."
          subtitle="Add measurements, statistics, results, awards, and source-backed athletic evidence without turning self-reported information into verified fact. Every observation stays in history."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting/profile">Athlete Profile & Film</PlaybookButton>
            <PlaybookButton href="/recruiting" variant="secondary">Recruiting Command Center</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? <div role="alert" style={errorState}><strong>Evidence needs attention.</strong> {error}</div> : null}
        {message ? <div role="status" style={successState}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Evidence records" value={String(summary.total)} />
          <PlaybookMetric label="Self reported" value={String(summary.selfReported)} />
          <PlaybookMetric label="In review" value={String(summary.submitted)} />
          <PlaybookMetric label="Verified" value={String(summary.verified)} />
        </PlaybookMetrics>

        <div style={workspaceGrid}>
          <section style={panel} aria-labelledby="add-evidence-heading">
            <PlaybookPill>Append-only record</PlaybookPill>
            <h2 id="add-evidence-heading" style={sectionTitle}>Add evidence</h2>
            <p style={muted}>New entries are saved as self-reported evidence. You cannot mark your own evidence verified or edit history in place.</p>

            <form onSubmit={submitEvidence} style={formGrid}>
              <label style={field}>Sport<span style={required}>Required</span><input required value={sport} onChange={(event) => setSport(event.target.value)} style={input} /></label>
              <label style={field}>Evidence type<select value={category} onChange={(event) => setCategory(event.target.value as EvidenceCategory)} style={input}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label style={field}>Metric / claim<span style={required}>Required</span><input required value={metricName} onChange={(event) => setMetricName(event.target.value)} style={input} placeholder="Vertical jump, points per game, tournament finish…" /></label>
              <label style={field}>Value<span style={required}>Required</span><input required value={value} onChange={(event) => setValue(event.target.value)} style={input} placeholder="28.5 or All-Tournament Team" /></label>
              <label style={field}>Unit<input value={unit} onChange={(event) => setUnit(event.target.value)} style={input} placeholder="in, sec, mph, ppg…" /></label>
              <label style={field}>Observed / earned date<span style={required}>Required</span><input required type="date" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} style={input} /></label>
              <label style={field}>Source type<select value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceType)} style={input}>{sourceTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label style={field}>Source label<input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} style={input} placeholder="Hudl, school stat sheet, tournament result…" /></label>
              <label style={{ ...field, gridColumn: "1 / -1" }}>Source URL<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} style={input} placeholder="https://…" /></label>
              {rows.length ? <label style={{ ...field, gridColumn: "1 / -1" }}>Correction / supersedes<select value={supersedesId} onChange={(event) => setSupersedesId(event.target.value)} style={input}><option value="">This is a new observation</option>{rows.slice(0, 20).map((row) => <option key={row.id} value={row.id}>{formatDate(row.observed_at)} · {row.metric_name} · {displayValue(row)}</option>)}</select><span style={helper}>Choose a prior record only when this new entry corrects or supersedes it. The earlier record remains preserved.</span></label> : null}
              <button disabled={saving} type="submit" style={primaryButton}>{saving ? "Adding evidence…" : "Add evidence to record"}</button>
            </form>
          </section>

          <section style={panel} aria-labelledby="history-heading">
            <div style={panelHeading}>
              <div>
                <PlaybookPill>Evidence history</PlaybookPill>
                <h2 id="history-heading" style={sectionTitle}>What your record actually contains</h2>
              </div>
              <span style={privateBadge}>Private · Scholar owned</span>
            </div>

            {rows.length === 0 ? (
              <div style={emptyState}>
                <h3 style={{ marginTop: 0 }}>No athletic evidence yet.</h3>
                <p style={muted}>Start with one real measurement, statistic, result, award, or film reference. Playbook will not invent athletic accomplishments to fill this space.</p>
              </div>
            ) : (
              <div style={evidenceList}>
                {rows.map((row) => (
                  <article key={row.id} style={evidenceCard}>
                    <div style={evidenceHeader}>
                      <div>
                        <span style={categoryLabel}>{formatLabel(row.category)}</span>
                        <h3 style={evidenceTitle}>{row.metric_name}</h3>
                        <p style={valueLine}>{displayValue(row)}{row.unit ? ` ${row.unit}` : ""}</p>
                      </div>
                      <span style={verificationBadge(row.verification_state)}>{formatLabel(row.verification_state)}</span>
                    </div>
                    <div style={detailGrid}>
                      <div><span style={detailLabel}>Observed</span><strong>{formatDate(row.observed_at)}</strong></div>
                      <div><span style={detailLabel}>Sport</span><strong>{row.sport}</strong></div>
                      <div><span style={detailLabel}>Source</span><strong>{row.source_label || formatLabel(row.source_type)}</strong></div>
                    </div>
                    {row.source_url ? <a href={row.source_url} target="_blank" rel="noreferrer" style={sourceLink}>Open source evidence</a> : null}
                    {row.verification_state === "self_reported" ? (
                      <button type="button" disabled={requestingId === row.id} onClick={() => void requestVerification(row)} style={reviewButton}>
                        {requestingId === row.id ? "Submitting for review…" : "Request independent verification"}
                      </button>
                    ) : null}
                    {row.verification_state === "submitted" ? <p style={reviewNote}>Independent review requested · awaiting governed review</p> : null}
                    {row.verification_state === "rejected" ? <p style={rejectedNote}>Verification was not approved. Add a corrected or better-sourced evidence record rather than overwriting this history.</p> : null}
                    {row.supersedes_evidence_id ? <p style={correctionNote}>Correction record · prior evidence preserved</p> : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section style={trustPanel}>
          <div>
            <p style={eyebrow}>Trust boundary</p>
            <h2 style={trustTitle}>Self-reported is useful. Verified means independently reviewed.</h2>
          </div>
          <p style={trustCopy}>You control what enters your athletic record. Requesting verification moves an evidence record into Playbook&apos;s governed Founder/Admin review queue. A final approval or rejection requires a recorded review reason and is preserved in the platform audit history.</p>
        </section>
      </div>
    </PlaybookPage>
  );
}

function displayValue(row: AthleteEvidenceRow) {
  return row.value_numeric !== null ? String(row.value_numeric) : row.value_text || "—";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function verificationBadge(state: AthleteEvidenceRow["verification_state"]): React.CSSProperties {
  const base: React.CSSProperties = { padding: "6px 9px", borderRadius: 999, fontSize: 10, fontWeight: 950, letterSpacing: ".06em", textTransform: "uppercase" };
  if (state === "verified") return { ...base, background: "#DCFCE7", color: "#166534" };
  if (state === "rejected") return { ...base, background: "#FEE2E2", color: "#991B1B" };
  if (state === "submitted") return { ...base, background: "#FEF3C7", color: "#92400E" };
  if (state === "superseded") return { ...base, background: "#E5E7EB", color: "#4B5563" };
  return { ...base, background: "#EAF2F8", color: "#36556F" };
}

const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 750 };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const successState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontWeight: 800 };
const workspaceGrid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,390px),1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #DDE6EF", borderRadius: 24, padding: "clamp(20px,3vw,32px)", boxShadow: "0 16px 50px rgba(15,23,42,.06)" };
const panelHeading: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "start" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 10px", color: "#102238", fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.05 };
const muted: React.CSSProperties = { color: "#61748A", lineHeight: 1.65 };
const privateBadge: React.CSSProperties = { color: "#6B7F94", fontSize: 12, fontWeight: 800 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 14, marginTop: 20 };
const field: React.CSSProperties = { display: "grid", gap: 7, alignContent: "start", color: "#20364E", fontWeight: 800, fontSize: 13 };
const required: React.CSSProperties = { marginLeft: 8, color: "#A94422", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #C7D4E0", padding: "10px 12px", font: "inherit", color: "#102238", background: "#FFFFFF" };
const helper: React.CSSProperties = { color: "#718399", fontWeight: 500, fontSize: 12, lineHeight: 1.5 };
const primaryButton: React.CSSProperties = { minHeight: 48, alignSelf: "end", border: 0, borderRadius: 999, padding: "0 20px", background: "#102238", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const emptyState: React.CSSProperties = { marginTop: 20, padding: 22, borderRadius: 18, background: "#F4F8FB", border: "1px dashed #B8C9D8", color: "#20364E" };
const evidenceList: React.CSSProperties = { display: "grid", gap: 12, marginTop: 20 };
const evidenceCard: React.CSSProperties = { padding: 18, borderRadius: 18, border: "1px solid #DDE6EF", background: "#FBFCFE" };
const evidenceHeader: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "start" };
const categoryLabel: React.CSSProperties = { color: "#D65F1F", fontSize: 10, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" };
const evidenceTitle: React.CSSProperties = { margin: "5px 0 3px", color: "#102238", fontSize: 22 };
const valueLine: React.CSSProperties = { margin: 0, color: "#20364E", fontSize: 18, fontWeight: 850 };
const detailGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #E6EDF4", color: "#20364E" };
const detailLabel: React.CSSProperties = { display: "block", marginBottom: 4, color: "#718399", fontSize: 10, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" };
const sourceLink: React.CSSProperties = { display: "inline-flex", marginTop: 14, color: "#A94422", fontWeight: 900, textDecoration: "none" };
const reviewButton: React.CSSProperties = { display: "flex", marginTop: 14, minHeight: 40, alignItems: "center", border: 0, borderRadius: 999, padding: "0 14px", background: "#102238", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const reviewNote: React.CSSProperties = { margin: "12px 0 0", color: "#92400E", fontSize: 12, fontWeight: 800 };
const rejectedNote: React.CSSProperties = { margin: "12px 0 0", color: "#991B1B", fontSize: 12, fontWeight: 700, lineHeight: 1.5 };
const correctionNote: React.CSSProperties = { margin: "12px 0 0", color: "#6B7F94", fontSize: 12, fontWeight: 750 };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", padding: "clamp(24px,4vw,38px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, alignItems: "center", borderRadius: "30px 8px 30px 8px", color: "#F8FAFC", background: "linear-gradient(145deg,#06172D,#0B2648)" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const trustTitle: React.CSSProperties = { margin: "9px 0 0", fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.04 };
const trustCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.7 };
