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
import {
  evaluateSourceBackedEligibilityReadiness,
  flattenRequirementNodes,
  type RequirementFinding,
  type SourceBackedEligibilityRuleset,
} from "@/lib/scholar-athlete/sourceBackedEligibility";

type RulesetRow = {
  id: string;
  ruleset_key: string;
  governing_body: string;
  pathway: string;
  certification_authority: string;
  authority_note: string;
  requirements_json: SourceBackedEligibilityRuleset["requirements"];
  athlete_eligibility_rule_sources: {
    title: string;
    source_url: string;
    retrieved_at: string;
  } | null;
};

type RequirementEvidenceRow = {
  id: string;
  scholar_id: string;
  ruleset_id: string;
  requirement_key: string;
  reported_state: "complete" | "incomplete";
  athlete_evidence_id: string | null;
  note: string | null;
  observed_at: string;
  supersedes_id: string | null;
  created_at: string;
  athlete_evidence: {
    verification_state: "self_reported" | "submitted" | "verified" | "rejected" | "superseded";
    metric_name: string;
    source_label: string | null;
  } | null;
};

type AthleticEvidenceOption = {
  id: string;
  metric_name: string;
  value_text: string | null;
  value_numeric: number | null;
  unit: string | null;
  verification_state: "self_reported" | "submitted" | "verified" | "rejected" | "superseded";
  observed_at: string;
};

export default function EligibilityReadinessPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [rulesets, setRulesets] = useState<RulesetRow[]>([]);
  const [selectedRulesetId, setSelectedRulesetId] = useState("");
  const [evidenceRows, setEvidenceRows] = useState<RequirementEvidenceRow[]>([]);
  const [athleticEvidence, setAthleticEvidence] = useState<AthleticEvidenceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [requirementKey, setRequirementKey] = useState("");
  const [reportedState, setReportedState] = useState<"complete" | "incomplete">("complete");
  const [linkedEvidenceId, setLinkedEvidenceId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/recruiting/eligibility");
        return;
      }

      setOwnerId(auth.user.id);

      const [rulesetResponse, requirementResponse, athleticResponse] = await Promise.all([
        supabase
          .from("athlete_eligibility_rulesets")
          .select("id,ruleset_key,governing_body,pathway,certification_authority,authority_note,requirements_json,athlete_eligibility_rule_sources(title,source_url,retrieved_at)")
          .eq("status", "active")
          .order("governing_body")
          .order("pathway"),
        supabase
          .from("athlete_eligibility_requirement_evidence")
          .select("id,scholar_id,ruleset_id,requirement_key,reported_state,athlete_evidence_id,note,observed_at,supersedes_id,created_at,athlete_evidence(verification_state,metric_name,source_label)")
          .eq("scholar_id", auth.user.id)
          .order("observed_at", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("athlete_evidence")
          .select("id,metric_name,value_text,value_numeric,unit,verification_state,observed_at")
          .eq("scholar_id", auth.user.id)
          .order("observed_at", { ascending: false }),
      ]);

      if (!active) return;
      const loadError = rulesetResponse.error || requirementResponse.error || athleticResponse.error;
      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }

      const loadedRulesets = (rulesetResponse.data || []) as unknown as RulesetRow[];
      setRulesets(loadedRulesets);
      setSelectedRulesetId(loadedRulesets[0]?.id || "");
      setEvidenceRows((requirementResponse.data || []) as unknown as RequirementEvidenceRow[]);
      setAthleticEvidence((athleticResponse.data || []) as AthleticEvidenceOption[]);
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [router]);

  const selected = useMemo(
    () => rulesets.find((ruleset) => ruleset.id === selectedRulesetId) || null,
    [rulesets, selectedRulesetId],
  );

  const requirementNodes = useMemo(
    () => flattenRequirementNodes(selected?.requirements_json.requirements || []),
    [selected],
  );

  const leafRequirements = useMemo(
    () => requirementNodes.filter((node) => !(node.requirements?.length || node.options?.length)),
    [requirementNodes],
  );

  const activeRequirementKey = leafRequirements.some((node) => node.key === requirementKey)
    ? requirementKey
    : leafRequirements[0]?.key || "";

  const selectedEvidenceRows = useMemo(
    () => evidenceRows.filter((row) => row.ruleset_id === selectedRulesetId),
    [evidenceRows, selectedRulesetId],
  );

  const latestByRequirement = useMemo(() => {
    const map = new Map<string, RequirementEvidenceRow>();
    for (const row of selectedEvidenceRows) {
      if (!map.has(row.requirement_key)) map.set(row.requirement_key, row);
    }
    return map;
  }, [selectedEvidenceRows]);

  const readiness = useMemo(() => {
    if (!selected) return null;
    const source = selected.athlete_eligibility_rule_sources;
    const normalized: SourceBackedEligibilityRuleset = {
      id: selected.id,
      rulesetKey: selected.ruleset_key,
      governingBody: selected.governing_body,
      pathway: selected.pathway,
      certificationAuthority: selected.certification_authority,
      authorityNote: selected.authority_note,
      sourceTitle: source?.title || "Authoritative source",
      sourceUrl: source?.source_url || "",
      sourceRetrievedAt: source?.retrieved_at || "",
      requirements: selected.requirements_json,
    };

    return evaluateSourceBackedEligibilityReadiness(
      normalized,
      selectedEvidenceRows.map((row) => ({
        requirementKey: row.requirement_key,
        reportedState: row.reported_state,
        athleteEvidenceVerificationState: row.athlete_evidence?.verification_state || null,
      })),
    );
  }, [selected, selectedEvidenceRows]);

  async function saveRequirementEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId || !selected || !activeRequirementKey) return;

    const prior = latestByRequirement.get(activeRequirementKey);
    setSaving(true);
    setError("");
    setMessage("");

    const { data, error: insertError } = await supabase
      .from("athlete_eligibility_requirement_evidence")
      .insert({
        scholar_id: ownerId,
        ruleset_id: selected.id,
        requirement_key: activeRequirementKey,
        reported_state: reportedState,
        athlete_evidence_id: linkedEvidenceId || null,
        note: note.trim() || null,
        observed_at: new Date().toISOString().slice(0, 10),
        supersedes_id: prior?.id || null,
        provenance: { entry_surface: "recruiting/eligibility" },
      })
      .select("id,scholar_id,ruleset_id,requirement_key,reported_state,athlete_evidence_id,note,observed_at,supersedes_id,created_at,athlete_evidence(verification_state,metric_name,source_label)")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Requirement evidence could not be saved.");
      setSaving(false);
      return;
    }

    setEvidenceRows((current) => [data as unknown as RequirementEvidenceRow, ...current]);
    setNote("");
    setLinkedEvidenceId("");
    setMessage("Readiness evidence added. The previous report remains preserved in history.");
    setSaving(false);
  }

  if (loading) {
    return <PlaybookPage><div data-testid="eligibility-readiness" style={loadingState}>Connecting source-backed eligibility readiness…</div></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="eligibility-readiness" data-visual-canon="PGER-001">
        <PlaybookHero
          eyebrow="Eligibility Readiness"
          title="Know what the record supports—and what only the governing body can decide."
          subtitle="Track source-backed initial-eligibility requirements without turning a Playbook checklist into an NCAA, NAIA, or institutional eligibility decision."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting/evidence">Athletic Evidence Ledger</PlaybookButton>
            <PlaybookButton href="/recruiting" variant="secondary">Recruiting Command Center</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? <div role="alert" style={errorState}>{error}</div> : null}
        {message ? <div role="status" style={successState}>{message}</div> : null}

        <section style={selectorPanel}>
          <label style={field}>
            Governing pathway
            <select value={selectedRulesetId} onChange={(event) => setSelectedRulesetId(event.target.value)} style={input}>
              {rulesets.map((ruleset) => (
                <option key={ruleset.id} value={ruleset.id}>{ruleset.governing_body} · {formatLabel(ruleset.pathway)}</option>
              ))}
            </select>
          </label>
          <div style={sourceBlock}>
            <span style={sourceLabel}>Canonical source</span>
            <strong>{selected?.athlete_eligibility_rule_sources?.title || "Source unavailable"}</strong>
            {selected?.athlete_eligibility_rule_sources?.source_url ? (
              <a href={selected.athlete_eligibility_rule_sources.source_url} target="_blank" rel="noreferrer" style={sourceLink}>Open governing-body source</a>
            ) : null}
            <small>Retrieved by Playbook: {formatDate(selected?.athlete_eligibility_rule_sources?.retrieved_at || "")}</small>
          </div>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Reported readiness" value={`${readiness?.readiness || 0}%`} />
          <PlaybookMetric label="Verified readiness" value={`${readiness?.verifiedReadiness || 0}%`} />
          <PlaybookMetric label="Official eligibility" value="Not determined" />
          <PlaybookMetric label="Authority" value={selected?.governing_body || "—"} />
        </PlaybookMetrics>

        <section style={authorityPanel}>
          <PlaybookPill>Authority boundary</PlaybookPill>
          <h2 style={authorityTitle}>{selected?.certification_authority || "Governing authority"} retains the decision.</h2>
          <p style={authorityCopy}>{selected?.authority_note || "Playbook tracks readiness only."}</p>
        </section>

        {selected ? (
          <div style={workspaceGrid}>
            <section style={panel} aria-labelledby="requirements-heading">
              <PlaybookPill>Source-backed requirements</PlaybookPill>
              <h2 id="requirements-heading" style={sectionTitle}>What your Playbook record supports</h2>
              <div style={requirementList}>
                {(readiness?.findings || []).map((finding) => (
                  <RequirementTree key={finding.key} finding={finding} latest={latestByRequirement} />
                ))}
              </div>
            </section>

            <section style={panel} aria-labelledby="report-heading">
              <PlaybookPill>Scholar evidence</PlaybookPill>
              <h2 id="report-heading" style={sectionTitle}>Add or correct a requirement report</h2>
              <p style={muted}>Reports are append-only. A new report supersedes the prior report for that requirement without deleting history.</p>

              {leafRequirements.length ? (
                <form onSubmit={saveRequirementEvidence} style={formGrid}>
                  <label style={field}>Requirement<select value={activeRequirementKey} onChange={(event) => setRequirementKey(event.target.value)} style={input}>{leafRequirements.map((node) => <option key={node.key} value={node.key}>{node.label || formatLabel(node.key)}</option>)}</select></label>
                  <label style={field}>Your current record<select value={reportedState} onChange={(event) => setReportedState(event.target.value as "complete" | "incomplete")} style={input}><option value="complete">I have completed / satisfied this</option><option value="incomplete">Not completed / not satisfied yet</option></select></label>
                  <label style={field}>Link existing verified evidence<select value={linkedEvidenceId} onChange={(event) => setLinkedEvidenceId(event.target.value)} style={input}><option value="">No linked Athletic Evidence record</option>{athleticEvidence.map((item) => <option key={item.id} value={item.id}>{item.verification_state === "verified" ? "Verified" : formatLabel(item.verification_state)} · {item.metric_name} · {displayAthleticValue(item)}</option>)}</select><span style={helper}>A link strengthens provenance. Only evidence already independently verified counts toward verified readiness.</span></label>
                  <label style={field}>Context / note<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} maxLength={2000} style={textarea} placeholder="What supports this report? Do not enter sensitive information that is not needed." /></label>
                  <button disabled={saving} type="submit" style={primaryButton}>{saving ? "Saving evidence…" : "Add requirement evidence"}</button>
                </form>
              ) : <p style={muted}>This ruleset has no Scholar-reportable leaf requirements.</p>}
            </section>
          </div>
        ) : (
          <section style={emptyState}>
            <h2>No active ruleset is available.</h2>
            <p>Playbook will not invent eligibility criteria when an authoritative source has not been registered.</p>
          </section>
        )}

        <section style={trustPanel}>
          <div>
            <p style={eyebrow}>Interpretation boundary</p>
            <h2 style={trustTitle}>Readiness is guidance. Eligibility is an external determination.</h2>
          </div>
          <p style={trustCopy}>A 100% reported or verified readiness score means the Playbook record contains evidence aligned to the registered ruleset. It does not mean the NCAA, NAIA, a college, or another governing authority has certified eligibility. Unknown requirements remain unknown rather than being guessed.</p>
        </section>
      </div>
    </PlaybookPage>
  );
}

function RequirementTree({ finding, latest, depth = 0 }: { finding: RequirementFinding; latest: Map<string, RequirementEvidenceRow>; depth?: number }) {
  const row = latest.get(finding.key);
  return (
    <div style={{ ...requirementCard, marginLeft: depth ? Math.min(depth * 14, 28) : 0 }}>
      <div style={requirementHeader}>
        <div>
          <strong style={requirementTitle}>{finding.label}</strong>
          {row ? <span style={historyText}>Latest report {formatDate(row.observed_at)}{row.athlete_evidence?.verification_state === "verified" ? " · linked verified evidence" : ""}</span> : <span style={historyText}>No Scholar evidence recorded</span>}
        </div>
        <span style={stateBadge(finding.state)}>{formatLabel(finding.state)}</span>
      </div>
      {finding.children.length ? <div style={childList}>{finding.children.map((child) => <RequirementTree key={child.key} finding={child} latest={latest} depth={depth + 1} />)}</div> : null}
    </div>
  );
}

function displayAthleticValue(item: AthleticEvidenceOption) {
  const value = item.value_numeric !== null ? String(item.value_numeric) : item.value_text || "—";
  return `${value}${item.unit ? ` ${item.unit}` : ""}`;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString();
}

function stateBadge(state: string): React.CSSProperties {
  if (state === "verified") return { ...badge, background: "#DCFCE7", color: "#166534" };
  if (state === "reported") return { ...badge, background: "#DBEAFE", color: "#1D4ED8" };
  if (state === "incomplete") return { ...badge, background: "#FEF3C7", color: "#92400E" };
  return { ...badge, background: "#F1F5F9", color: "#64748B" };
}

const loadingState: React.CSSProperties = { maxWidth: 1180, margin: "40px auto", padding: 28, color: "#475569" };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, border: "1px solid #FECACA", background: "#FEF2F2", color: "#991B1B", borderRadius: 10, fontWeight: 800 };
const successState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, border: "1px solid #BBF7D0", background: "#F0FDF4", color: "#166534", borderRadius: 10, fontWeight: 800 };
const selectorPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18, padding: 22, background: "#fff", border: "1px solid #E2E8F0", borderRadius: "24px 6px 24px 6px" };
const field: React.CSSProperties = { display: "grid", gap: 7, color: "#334155", fontSize: 12, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", minHeight: 44, border: "1px solid #CBD5E1", borderRadius: 10, padding: "0 12px", background: "#F8FAFC", color: "#0F172A", font: "inherit" };
const textarea: React.CSSProperties = { ...input, padding: 12, resize: "vertical" };
const helper: React.CSSProperties = { color: "#64748B", lineHeight: 1.45, fontWeight: 600 };
const sourceBlock: React.CSSProperties = { display: "grid", gap: 6, color: "#334155" };
const sourceLabel: React.CSSProperties = { color: "#64748B", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" };
const sourceLink: React.CSSProperties = { color: "#C2410C", fontWeight: 900, textDecoration: "none" };
const authorityPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: 24, border: "1px solid #FED7AA", background: "#FFF7ED", borderRadius: "6px 24px 6px 24px" };
const authorityTitle: React.CSSProperties = { margin: "12px 0 8px", color: "#7C2D12", fontSize: "clamp(24px,4vw,34px)" };
const authorityCopy: React.CSSProperties = { margin: 0, color: "#9A3412", lineHeight: 1.65 };
const workspaceGrid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: "24px 6px 24px 6px", padding: "clamp(20px,4vw,28px)" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 8px", color: "#0F172A", fontSize: "clamp(25px,4vw,34px)" };
const muted: React.CSSProperties = { color: "#64748B", lineHeight: 1.65 };
const requirementList: React.CSSProperties = { display: "grid", gap: 10, marginTop: 18 };
const requirementCard: React.CSSProperties = { padding: 14, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" };
const requirementHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 };
const requirementTitle: React.CSSProperties = { display: "block", color: "#0F172A" };
const historyText: React.CSSProperties = { display: "block", marginTop: 4, color: "#64748B", fontSize: 11, fontWeight: 650 };
const badge: React.CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 26, padding: "0 9px", borderRadius: 999, fontSize: 10, fontWeight: 950, textTransform: "uppercase", letterSpacing: ".06em" };
const childList: React.CSSProperties = { display: "grid", gap: 8, marginTop: 10 };
const formGrid: React.CSSProperties = { display: "grid", gap: 14, marginTop: 18 };
const primaryButton: React.CSSProperties = { border: 0, borderRadius: 10, minHeight: 46, padding: "0 16px", background: "#F97316", color: "#fff", fontWeight: 950, cursor: "pointer" };
const emptyState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: 28, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, color: "#334155" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 32px", padding: "clamp(24px,4vw,34px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, alignItems: "center", color: "#F8FAFC", background: "linear-gradient(145deg,#06172D,#0B2648)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px 30px 8px 30px" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const trustTitle: React.CSSProperties = { margin: "9px 0 0", fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.04 };
const trustCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.7 };
