"use client";

import { useEffect, useState } from "react";
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
import type {
  NILPreparationDimension,
  NILPreparationFinding,
  NILPreparationReview,
  NILPreparationReviewStatus,
} from "@/lib/scholar-athlete/nilPreparationEngine";

type PreparationResponse = {
  findings?: NILPreparationFinding[];
  reviews?: NILPreparationReview[];
  summary?: { dimensions: number; reviewed: number; actionNeeded: number; recordBacked: number };
  error?: string;
};

type ReviewDraft = { reviewStatus: NILPreparationReviewStatus; reflection: string };

const statusOptions: Array<{ value: NILPreparationReviewStatus; label: string }> = [
  { value: "not_started", label: "Not reviewed" },
  { value: "in_progress", label: "Review in progress" },
  { value: "reviewed", label: "I reviewed this" },
  { value: "action_needed", label: "Action needed" },
];

async function loadPreparation(): Promise<PreparationResponse> {
  const response = await fetch("/api/recruiting/nil-preparation", { cache: "no-store" });
  const result = await response.json() as PreparationResponse;
  if (!response.ok) throw new Error(result.error || "NIL preparation could not be loaded.");
  return result;
}

export default function NILPreparationPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [findings, setFindings] = useState<NILPreparationFinding[]>([]);
  const [summary, setSummary] = useState<PreparationResponse["summary"]>();
  const [drafts, setDrafts] = useState<Partial<Record<NILPreparationDimension, ReviewDraft>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<NILPreparationDimension | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function applyResult(result: PreparationResponse) {
    setFindings(result.findings || []);
    setSummary(result.summary);
    const nextDrafts: Partial<Record<NILPreparationDimension, ReviewDraft>> = {};
    for (const finding of result.findings || []) {
      const review = (result.reviews || []).find((item) => item.dimension === finding.dimension);
      nextDrafts[finding.dimension] = {
        reviewStatus: review?.reviewStatus || "not_started",
        reflection: review?.reflection || "",
      };
    }
    setDrafts(nextDrafts);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/recruiting/nil/preparation");
        return;
      }
      try {
        const result = await loadPreparation();
        if (!active) return;
        setOwnerId(auth.user.id);
        await applyResult(result);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "NIL preparation could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  function updateDraft(dimension: NILPreparationDimension, patch: Partial<ReviewDraft>) {
    setDrafts((current) => ({
      ...current,
      [dimension]: { reviewStatus: "not_started", reflection: "", ...current[dimension], ...patch },
    }));
  }

  async function saveReview(dimension: NILPreparationDimension) {
    if (!ownerId) return;
    const draft = drafts[dimension] || { reviewStatus: "not_started" as const, reflection: "" };
    setSaving(dimension);
    setError("");
    setMessage("");

    const { error: saveError } = await supabase.from("nil_preparation_reviews").upsert({
      scholar_id: ownerId,
      dimension,
      review_status: draft.reviewStatus,
      reflection: draft.reflection.trim() || null,
      reviewed_at: draft.reviewStatus === "reviewed" ? new Date().toISOString() : null,
    }, { onConflict: "scholar_id,dimension" });

    if (saveError) {
      setError(saveError.message);
      setSaving(null);
      return;
    }

    try {
      await applyResult(await loadPreparation());
      setMessage("Your NIL preparation review was saved to your private Scholar-Athlete record.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review saved, but readiness could not be refreshed.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <PlaybookPage><div style={loadingState}>Connecting your NIL preparation record…</div></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="nil-preparation" data-visual-canon="PGNP-001">
        <PlaybookHero
          eyebrow="NIL Preparation"
          title="Build readiness from your real record—not a vanity score."
          subtitle="Playbook brings together your profile, learning progress, athlete media, and real NIL opportunities, then lets you record your own review. Record signals are evidence of preparation activity; they are never legal, tax, school, conference, governing-body, or brand approval."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting/nil">NIL Deal Tracker</PlaybookButton>
            <PlaybookButton href="/courses/money-in-the-game" variant="secondary">Money in the Game</PlaybookButton>
            <PlaybookButton href="/scholar-athlete-os" variant="secondary">Scholar-Athlete OS</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? <div role="alert" style={errorState}><strong>NIL preparation needs attention.</strong> {error}</div> : null}
        {message ? <div role="status" style={successState}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Preparation domains" value={String(summary?.dimensions || 7)} />
          <PlaybookMetric label="Scholar reviewed" value={String(summary?.reviewed || 0)} />
          <PlaybookMetric label="Action needed" value={String(summary?.actionNeeded || 0)} />
          <PlaybookMetric label="Record-backed signals" value={String(summary?.recordBacked || 0)} />
        </PlaybookMetrics>

        <section style={boundaryPanel} aria-labelledby="nil-boundary-heading">
          <PlaybookPill>How to read this workspace</PlaybookPill>
          <h2 id="nil-boundary-heading" style={sectionTitle}>Three truths stay separate.</h2>
          <div style={boundaryGrid}>
            <Boundary title="Record-backed signal" copy="Playbook can see a factual preparation signal in a canonical record, such as course progress, profile media, or a tracked deal." />
            <Boundary title="Scholar review" copy="You decide whether you have reviewed a preparation area and what still needs action. Your reflection is yours." />
            <Boundary title="Authority-required review" copy="Compliance, contracts, taxes, school rules, and governing-body requirements may require an authorized person or source. Playbook does not convert readiness into clearance." />
          </div>
        </section>

        <section style={grid} aria-label="NIL preparation dimensions">
          {findings.map((finding) => {
            const draft = drafts[finding.dimension] || { reviewStatus: finding.reviewStatus, reflection: "" };
            return (
              <article key={finding.dimension} style={card}>
                <div style={cardHeader}>
                  <div>
                    <span style={signalBadge(finding.signal)}>{signalLabel(finding.signal)}</span>
                    <h2 style={cardTitle}>{finding.title}</h2>
                  </div>
                  <span style={reviewBadge}>{formatLabel(draft.reviewStatus)}</span>
                </div>

                <div style={evidenceBox}>
                  <strong style={miniHeading}>What the Playbook Record can verify</strong>
                  <ul style={evidenceList}>{finding.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>

                <p style={nextAction}><strong>Next action:</strong> {finding.nextAction}</p>
                {finding.authorityBoundary ? <p style={authorityNote}><strong>Authority boundary:</strong> {finding.authorityBoundary}</p> : null}

                <div style={reviewForm}>
                  <label style={field}>Your review status
                    <select value={draft.reviewStatus} onChange={(event) => updateDraft(finding.dimension, { reviewStatus: event.target.value as NILPreparationReviewStatus })} style={input}>
                      {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label style={field}>Private reflection
                    <textarea value={draft.reflection} maxLength={4000} onChange={(event) => updateDraft(finding.dimension, { reflection: event.target.value })} placeholder="What did you learn? What do you still need to do or ask?" style={textarea} />
                  </label>
                  <button type="button" disabled={saving === finding.dimension} onClick={() => void saveReview(finding.dimension)} style={saveButton}>
                    {saving === finding.dimension ? "Saving…" : "Save my review"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section style={nextPanel}>
          <div><p style={eyebrow}>Build from canonical owners</p><h2 style={nextTitle}>Improve the source record, then return here.</h2></div>
          <div style={heroActions}>
            <PlaybookButton href="/profile">Profile & Brand Basics</PlaybookButton>
            <PlaybookButton href="/recruiting/profile" variant="secondary">Athlete Profile & Film</PlaybookButton>
            <PlaybookButton href="/courses" variant="secondary">Learning Library</PlaybookButton>
            <PlaybookButton href="/recruiting/nil" variant="secondary">NIL Opportunities</PlaybookButton>
          </div>
        </section>
      </div>
    </PlaybookPage>
  );
}

function Boundary({ title, copy }: { title: string; copy: string }) {
  return <div style={boundaryItem}><strong>{title}</strong><span style={boundaryCopy}>{copy}</span></div>;
}
function signalLabel(signal: NILPreparationFinding["signal"]) {
  return signal === "record_backed" ? "Record-backed" : signal === "partial_record" ? "Partial record" : "No record signal";
}
function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function signalBadge(signal: NILPreparationFinding["signal"]): React.CSSProperties {
  return { ...baseBadge, background: signal === "record_backed" ? "#ECFDF5" : signal === "partial_record" ? "#FFF7ED" : "#F1F5F9", color: signal === "record_backed" ? "#047857" : signal === "partial_record" ? "#C2410C" : "#475569" };
}

const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 800 };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const successState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontWeight: 800 };
const boundaryPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: "clamp(22px,4vw,34px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "white" };
const sectionTitle: React.CSSProperties = { margin: "10px 0 18px", fontSize: "clamp(28px,4vw,42px)" };
const boundaryGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const boundaryItem: React.CSSProperties = { display: "grid", gap: 7, padding: 17, borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" };
const boundaryCopy: React.CSSProperties = { color: "#C9D8E8", fontSize: 13, lineHeight: 1.55 };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,350px),1fr))", gap: 16 };
const card: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 15, padding: "clamp(20px,3vw,28px)", borderRadius: 22, background: "#FFFFFF", border: "1px solid #DDE6EF", boxShadow: "0 14px 40px rgba(15,23,42,.05)" };
const cardHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" };
const baseBadge: React.CSSProperties = { display: "inline-block", padding: "6px 9px", borderRadius: 999, fontSize: 10, fontWeight: 950, textTransform: "uppercase", letterSpacing: ".08em" };
const reviewBadge: React.CSSProperties = { ...baseBadge, background: "#EEF2FF", color: "#4338CA" };
const cardTitle: React.CSSProperties = { margin: "10px 0 0", color: "#102238", fontSize: 24 };
const evidenceBox: React.CSSProperties = { padding: 15, borderRadius: 15, background: "#F6F9FC", border: "1px solid #E1EAF2" };
const miniHeading: React.CSSProperties = { color: "#20364E", fontSize: 12 };
const evidenceList: React.CSSProperties = { margin: "9px 0 0", paddingLeft: 19, color: "#526A82", fontSize: 13, lineHeight: 1.6 };
const nextAction: React.CSSProperties = { margin: 0, color: "#334E68", lineHeight: 1.6 };
const authorityNote: React.CSSProperties = { margin: 0, padding: 12, borderRadius: 12, background: "#FFF7ED", color: "#9A3412", fontSize: 13, lineHeight: 1.55 };
const reviewForm: React.CSSProperties = { display: "grid", gap: 10, marginTop: "auto", paddingTop: 5 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#20364E", fontSize: 12, fontWeight: 900 };
const input: React.CSSProperties = { width: "100%", minHeight: 44, boxSizing: "border-box", borderRadius: 12, border: "1px solid #C9D6E2", padding: "0 12px", background: "#FBFCFE", color: "#102238", font: "inherit" };
const textarea: React.CSSProperties = { ...input, minHeight: 104, padding: 12, resize: "vertical" };
const saveButton: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 999, padding: "0 16px", background: "#F97316", color: "white", fontWeight: 950, cursor: "pointer" };
const nextPanel: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 28px", padding: "clamp(22px,4vw,34px)", borderRadius: 24, background: "#FFFFFF", border: "1px solid #DDE6EF" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const nextTitle: React.CSSProperties = { margin: "7px 0", color: "#102238", fontSize: "clamp(27px,4vw,40px)" };
