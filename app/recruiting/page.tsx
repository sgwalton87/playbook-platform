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
import {
  getRecruitingPipelineSummary,
  rankRecruitingTargets,
  type RecruitingStage,
  type RecruitingTarget,
} from "@/lib/scholar-athlete/recruitingEngine";
import { supabase } from "@/lib/supabaseClient";

const stages: RecruitingStage[] = [
  "researching",
  "watchlist",
  "contacted",
  "conversation",
  "visit",
  "offer",
  "committed",
  "closed",
];

type TargetRow = {
  id: string;
  school_name: string;
  athletic_program: string | null;
  division: string | null;
  coach_name: string | null;
  coach_email: string | null;
  stage: RecruitingStage;
  next_action: string | null;
  next_action_due_at: string | null;
  notes: string | null;
};

function mapTarget(row: TargetRow): RecruitingTarget {
  return {
    id: row.id,
    schoolName: row.school_name,
    athleticProgram: row.athletic_program || undefined,
    division: row.division || undefined,
    coachName: row.coach_name || undefined,
    coachEmail: row.coach_email || undefined,
    stage: row.stage,
    nextAction: row.next_action || undefined,
    nextActionDueAt: row.next_action_due_at || undefined,
    notes: row.notes || undefined,
  };
}

export default function RecruitingPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [targets, setTargets] = useState<RecruitingTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [program, setProgram] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [nextAction, setNextAction] = useState("");

  const rankedTargets = useMemo(() => rankRecruitingTargets(targets), [targets]);
  const summary = useMemo(() => getRecruitingPipelineSummary(targets), [targets]);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }

      const { data, error: targetError } = await supabase
        .from("recruiting_targets")
        .select("id,school_name,athletic_program,division,coach_name,coach_email,stage,next_action,next_action_due_at,notes")
        .eq("scholar_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (targetError) {
        setError(targetError.message);
        setLoading(false);
        return;
      }

      setOwnerId(auth.user.id);
      setTargets(((data || []) as TargetRow[]).map(mapTarget));
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [router]);

  async function addTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId || !schoolName.trim()) return;

    setSaving(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("recruiting_targets")
      .insert({
        scholar_id: ownerId,
        school_name: schoolName.trim(),
        athletic_program: program.trim() || null,
        coach_name: coachName.trim() || null,
        coach_email: coachEmail.trim() || null,
        next_action: nextAction.trim() || null,
        stage: "researching",
      })
      .select("id,school_name,athletic_program,division,coach_name,coach_email,stage,next_action,next_action_due_at,notes")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Recruiting target could not be saved.");
      setSaving(false);
      return;
    }

    setTargets((current) => [mapTarget(data as TargetRow), ...current]);
    setSchoolName("");
    setProgram("");
    setCoachName("");
    setCoachEmail("");
    setNextAction("");
    setSaving(false);
  }

  async function updateStage(targetId: string, stage: RecruitingStage) {
    if (!ownerId) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("recruiting_targets")
      .update({ stage })
      .eq("id", targetId)
      .eq("scholar_id", ownerId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setTargets((current) => current.map((target) => target.id === targetId ? { ...target, stage } : target));
    setSaving(false);
  }

  if (loading) {
    return <PlaybookPage><div data-testid="recruiting-command-center" style={loadingState}>Connecting your private recruiting record…</div></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="recruiting-command-center" data-visual-canon="PGRC-001">
        <PlaybookHero
          eyebrow="Recruiting Command Center"
          title="Turn recruiting interest into an intentional decision."
          subtitle="Track schools, coaches, conversations, visits, offers, and commitments in one private Scholar-Athlete journey. Your pipeline is evidence—not a popularity score."
        >
          <div style={heroActions}>
            <PlaybookButton href="/scholar-athlete-os">Back to Scholar-Athlete OS</PlaybookButton>
            <PlaybookButton href="/academic-readiness" variant="secondary">Check eligibility readiness</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? <div role="alert" style={errorState}><strong>Recruiting needs attention.</strong> {error}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="Targets" value={String(summary.total)} />
          <PlaybookMetric label="Conversations" value={String(summary.conversations)} />
          <PlaybookMetric label="Visits" value={String(summary.visits)} />
          <PlaybookMetric label="Offers" value={String(summary.offers)} />
          <PlaybookMetric label="Committed" value={String(summary.committed)} />
        </PlaybookMetrics>

        <section style={journeyRail} aria-label="Recruiting journey">
          {stages.slice(0, 7).map((stage, index) => (
            <div key={stage} style={journeyStep}>
              <span style={stepNumber}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{formatStage(stage)}</strong>
            </div>
          ))}
        </section>

        <div style={workspaceGrid}>
          <section style={panel} aria-labelledby="add-target-heading">
            <PlaybookPill>Build the pipeline</PlaybookPill>
            <h2 id="add-target-heading" style={sectionTitle}>Add a school or program</h2>
            <p style={muted}>Start with what you know. Coach information and next actions can be added without pretending contact has happened.</p>
            <form onSubmit={addTarget} style={formGrid}>
              <label style={field}>School or institution<span style={required}>Required</span><input required value={schoolName} onChange={(event) => setSchoolName(event.target.value)} style={input} /></label>
              <label style={field}>Athletic program<input value={program} onChange={(event) => setProgram(event.target.value)} style={input} placeholder="Women's Basketball" /></label>
              <label style={field}>Coach name<input value={coachName} onChange={(event) => setCoachName(event.target.value)} style={input} /></label>
              <label style={field}>Coach email<input type="email" value={coachEmail} onChange={(event) => setCoachEmail(event.target.value)} style={input} /></label>
              <label style={field}>Next action<input value={nextAction} onChange={(event) => setNextAction(event.target.value)} style={input} placeholder="Send introduction and film" /></label>
              <button disabled={saving} type="submit" style={primaryButton}>{saving ? "Saving…" : "Add recruiting target"}</button>
            </form>
          </section>

          <section style={panel} aria-labelledby="pipeline-heading">
            <div style={panelHeading}>
              <div>
                <PlaybookPill>Live pipeline</PlaybookPill>
                <h2 id="pipeline-heading" style={sectionTitle}>Your recruiting targets</h2>
              </div>
              <span style={recordTruth}>{targets.length === 0 ? "No verified activity yet" : `${targets.length} private record${targets.length === 1 ? "" : "s"}`}</span>
            </div>

            {rankedTargets.length === 0 ? (
              <div style={emptyState}>
                <h3 style={{ marginTop: 0 }}>Start with one real target.</h3>
                <p style={muted}>No demo schools or fabricated coach activity are shown. Add a school when it is genuinely part of your recruiting plan.</p>
              </div>
            ) : (
              <div style={targetList}>
                {rankedTargets.map((target) => (
                  <article key={target.id} style={targetCard}>
                    <div style={targetHeader}>
                      <div>
                        <span style={stageLabel}>{formatStage(target.stage)}</span>
                        <h3 style={targetTitle}>{target.schoolName}</h3>
                        <p style={targetMeta}>{[target.athleticProgram, target.division].filter(Boolean).join(" · ") || "Program details not added"}</p>
                      </div>
                      <select aria-label={`Recruiting stage for ${target.schoolName}`} disabled={saving} value={target.stage} onChange={(event) => void updateStage(target.id, event.target.value as RecruitingStage)} style={select}>
                        {stages.map((stage) => <option key={stage} value={stage}>{formatStage(stage)}</option>)}
                      </select>
                    </div>
                    <div style={detailGrid}>
                      <div><span style={detailLabel}>Coach</span><strong>{target.coachName || "Not added"}</strong></div>
                      <div><span style={detailLabel}>Next action</span><strong>{target.nextAction || "Choose the next move"}</strong></div>
                    </div>
                    {target.coachEmail ? <a href={`mailto:${target.coachEmail}`} style={mailLink}>Email {target.coachName || "coach"}</a> : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section style={agencyPanel}>
          <div>
            <p style={eyebrow}>Human decision</p>
            <h2 style={agencyTitle}>An offer is not a decision made for you.</h2>
          </div>
          <p style={agencyCopy}>Playbook can organize evidence, surface next actions, and show momentum. The Scholar and their trusted support network decide where to engage, visit, accept, or commit.</p>
        </section>
      </div>
    </PlaybookPage>
  );
}

function formatStage(stage: string) {
  return stage.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 750 };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const journeyRail: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", overflow: "hidden", background: "linear-gradient(115deg,#102A4A,#102238 60%,#2B1838)", color: "#F8FAFC", borderRadius: "8px 30px 8px 30px", border: "1px solid rgba(255,255,255,.12)" };
const journeyStep: React.CSSProperties = { padding: 18, display: "grid", gap: 6, borderRight: "1px solid rgba(255,255,255,.1)", fontSize: 13 };
const stepNumber: React.CSSProperties = { color: "#FF9D5C", fontWeight: 950 };
const workspaceGrid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #DDE6EF", borderRadius: 24, padding: "clamp(20px,3vw,32px)", boxShadow: "0 16px 50px rgba(15,23,42,.06)" };
const panelHeading: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "start" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 10px", color: "#102238", fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.05 };
const muted: React.CSSProperties = { color: "#61748A", lineHeight: 1.65 };
const formGrid: React.CSSProperties = { display: "grid", gap: 14, marginTop: 20 };
const field: React.CSSProperties = { display: "grid", gap: 7, color: "#20364E", fontWeight: 800, fontSize: 13 };
const required: React.CSSProperties = { marginLeft: 8, color: "#A94422", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #C7D4E0", padding: "10px 12px", font: "inherit", color: "#102238", background: "#FFFFFF" };
const primaryButton: React.CSSProperties = { minHeight: 46, border: 0, borderRadius: 999, padding: "0 18px", background: "#102238", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const recordTruth: React.CSSProperties = { color: "#6B7F94", fontSize: 12, fontWeight: 800 };
const emptyState: React.CSSProperties = { marginTop: 20, padding: 22, borderRadius: 18, background: "#F4F8FB", border: "1px dashed #B8C9D8", color: "#20364E" };
const targetList: React.CSSProperties = { display: "grid", gap: 12, marginTop: 20 };
const targetCard: React.CSSProperties = { padding: 18, borderRadius: 18, border: "1px solid #DDE6EF", background: "#FBFCFE" };
const targetHeader: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between", alignItems: "start" };
const stageLabel: React.CSSProperties = { color: "#D65F1F", fontSize: 10, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" };
const targetTitle: React.CSSProperties = { margin: "5px 0 3px", color: "#102238", fontSize: 22 };
const targetMeta: React.CSSProperties = { margin: 0, color: "#718399", fontSize: 13 };
const select: React.CSSProperties = { minHeight: 40, borderRadius: 10, border: "1px solid #C7D4E0", padding: "8px 10px", background: "#FFFFFF", color: "#102238", fontWeight: 800 };
const detailGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #E6EDF4", color: "#20364E" };
const detailLabel: React.CSSProperties = { display: "block", marginBottom: 4, color: "#718399", fontSize: 10, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" };
const mailLink: React.CSSProperties = { display: "inline-flex", marginTop: 15, color: "#A94422", fontWeight: 900, textDecoration: "none" };
const agencyPanel: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", padding: "clamp(24px,4vw,38px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, alignItems: "center", borderRadius: "30px 8px 30px 8px", color: "#F8FAFC", background: "linear-gradient(145deg,#06172D,#0B2648)" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const agencyTitle: React.CSSProperties = { margin: "9px 0 0", fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.04 };
const agencyCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.7 };
