"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";
import {
  buildAcademicReadinessSnapshot,
  type AcademicProgressRow,
  type AcademicReadinessSnapshot,
  type ApplicationWorkspaceSummary,
} from "@/lib/academic-readiness/academicReadiness";

type DecisionState = "PENDING" | "ACCEPTED" | "REJECTED" | "MODIFIED" | "COMPLETED";

type EvidenceRecord = {
  id: string;
  recommendation_key: string | null;
  decision_state: DecisionState;
  decision_note: string | null;
  outcome: Record<string, unknown> | null;
};

const readinessAreas = [
  { label: "Transcript intelligence", title: "Start with the evidence", body: "Upload or review the academic record that powers A–G calculations and readiness decisions.", href: "/transcript", action: "Open transcript" },
  { label: "Application workspace", title: "Move readiness into execution", body: "Use your existing application workspaces for requirements, evidence, documents, review, and submission progress.", href: "/application-workspaces", action: "Open applications" },
  { label: "Scholar Record", title: "Keep the whole story connected", body: "Academic progress remains part of the same Scholar Record as achievements, experiences, goals, and verified evidence.", href: "/record", action: "Open Scholar Record" },
  { label: "Compass", title: "Turn evidence into guidance", body: "Compass can build on the same canonical readiness evidence without replacing your record or your decisions.", href: "/compass", action: "Open Compass" },
  { label: "Support", title: "Bring the right people into the plan", body: "Coordinate counselors, educators, family, mentors, and coaches through authorized relationships.", href: "/support-network", action: "Open support network" },
  { label: "Opportunity", title: "Activate what your progress unlocks", body: "Explore opportunities after current academic blockers and active application work are understood.", href: "/opportunities", action: "Explore opportunities" },
] as const;

export default function AcademicReadinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [agProgress, setAgProgress] = useState<AcademicProgressRow[]>([]);
  const [applications, setApplications] = useState<ApplicationWorkspaceSummary[]>([]);
  const [evidenceRecord, setEvidenceRecord] = useState<EvidenceRecord | null>(null);

  const snapshot = useMemo<AcademicReadinessSnapshot>(
    () => buildAcademicReadinessSnapshot({ agProgress, applications }),
    [agProgress, applications]
  );

  const loadReadiness = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      router.replace("/login");
      return;
    }

    const ownerId = authData.user.id;
    setUserId(ownerId);

    const [agResult, applicationResult] = await Promise.all([
      supabase
        .from("ag_progress")
        .select("subject,years_completed,years_required,in_progress")
        .eq("user_id", ownerId),
      supabase
        .from("application_workspaces")
        .select("id,opportunity_name,opportunity_type,status,deadline")
        .eq("scholar_id", ownerId)
        .neq("status", "archived"),
    ]);

    if (agResult.error || applicationResult.error) {
      setError(agResult.error?.message || applicationResult.error?.message || "Academic readiness could not be loaded.");
      setLoading(false);
      return;
    }

    const nextAgProgress = (agResult.data || []) as AcademicProgressRow[];
    const nextApplications = (applicationResult.data || []) as ApplicationWorkspaceSummary[];
    const nextSnapshot = buildAcademicReadinessSnapshot({ agProgress: nextAgProgress, applications: nextApplications });
    const idempotencyKey = `academic-readiness:${ownerId}:${nextSnapshot.primaryRecommendation.key}:${nextSnapshot.readinessScore}`;
    const now = new Date().toISOString();

    const { data: record, error: evidenceError } = await supabase
      .from("academic_journey_evidence")
      .upsert(
        {
          owner_id: ownerId,
          readiness_score: nextSnapshot.readinessScore,
          ag_updates: nextSnapshot.agSubjectsMet,
          idempotency_key: idempotencyKey,
          delivery_state: "DELIVERED",
          delivered_at: now,
          recommendation_key: nextSnapshot.primaryRecommendation.key,
          primary_recommendation: nextSnapshot.primaryRecommendation,
          provenance: [
            { source: "ag_progress", count: nextAgProgress.length },
            { source: "application_workspaces", count: nextApplications.length },
          ],
          updated_at: now,
        },
        { onConflict: "idempotency_key" }
      )
      .select("id,recommendation_key,decision_state,decision_note,outcome")
      .single();

    if (evidenceError) {
      setError(evidenceError.message);
      setLoading(false);
      return;
    }

    setAgProgress(nextAgProgress);
    setApplications(nextApplications);
    setEvidenceRecord(record as EvidenceRecord);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadReadiness();
  }, [loadReadiness]);

  async function decide(decision: DecisionState, followAction = false) {
    if (!evidenceRecord || !userId) return;
    setSaving(true);
    setError(null);

    const now = new Date().toISOString();
    const outcome = decision === "COMPLETED"
      ? {
          status: "completed",
          recommendation_key: snapshot.primaryRecommendation.key,
          completed_at: now,
        }
      : evidenceRecord.outcome;
    const updatePayload: Record<string, unknown> = {
      decision_state: decision,
      decision_at: now,
      updated_at: now,
    };

    if (decision === "COMPLETED") {
      updatePayload.outcome = outcome;
      updatePayload.outcome_at = now;
    }

    const { error: updateError } = await supabase
      .from("academic_journey_evidence")
      .update(updatePayload)
      .eq("id", evidenceRecord.id)
      .eq("owner_id", userId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setEvidenceRecord({ ...evidenceRecord, decision_state: decision, outcome });
    setSaving(false);

    if (followAction) router.push(snapshot.primaryRecommendation.actionRoute);
  }

  if (loading) {
    return (
      <PlaybookPage>
        <div data-testid="academic-readiness" data-visual-canon="PGAR-001" style={loadingState}>
          Connecting your private academic record…
        </div>
      </PlaybookPage>
    );
  }

  return (
    <PlaybookPage>
      <div data-testid="academic-readiness" data-visual-canon="PGAR-001">
        <PlaybookHero
          eyebrow="Academic Readiness"
          title="Your academic record should produce a next play."
          subtitle="Playbook now connects transcript evidence, A–G readiness, active applications, your decision, and the resulting outcome without replacing your judgment."
        >
          <div style={actions}>
            <PlaybookButton href="/transcript">Review transcript</PlaybookButton>
            <PlaybookButton href="/record" variant="secondary">View Scholar Record</PlaybookButton>
          </div>
        </PlaybookHero>

        {error ? (
          <section role="alert" style={errorState}>
            <strong>Academic readiness needs attention.</strong>
            <span>{error}</span>
            <button type="button" onClick={() => void loadReadiness()} style={retryButton}>Try again</button>
          </section>
        ) : null}

        <section style={loop} aria-label="Academic readiness loop">
          {[
            ["01", "Evidence", "Transcript and canonical academic records"],
            ["02", "Intelligence", "Explainable readiness and priority"],
            ["03", "Decision", "You accept, reject, or defer the play"],
            ["04", "Outcome", "Progress is recorded and measurable"],
          ].map(([number, label, detail]) => (
            <article key={number} style={loopStep}>
              <span style={numberStyle}>{number}</span>
              <div><strong style={loopLabel}>{label}</strong><p style={loopDetail}>{detail}</p></div>
            </article>
          ))}
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Academic readiness" value={`${snapshot.readinessScore}%`} />
          <PlaybookMetric label="A–G subject areas" value={`${snapshot.agSubjectsMet}/${snapshot.agSubjectsTotal}`} />
          <PlaybookMetric label="Applications building" value={String(snapshot.applicationsBuilding)} />
          <PlaybookMetric label="Applications ready" value={String(snapshot.applicationsReady)} />
        </PlaybookMetrics>

        <section style={recommendationShell} aria-labelledby="academic-next-play">
          <div style={recommendationHeader}>
            <div>
              <p style={eyebrow}>Compass-ready recommendation</p>
              <h2 id="academic-next-play" style={recommendationTitle}>{snapshot.primaryRecommendation.title}</h2>
            </div>
            <span style={confidenceBadge}>{Math.round(snapshot.primaryRecommendation.confidence * 100)}% confidence</span>
          </div>

          <p style={recommendationBody}>{snapshot.primaryRecommendation.explanation}</p>

          <div style={evidenceBox}>
            <strong>Why Playbook is recommending this</strong>
            <ul style={evidenceList}>
              {snapshot.primaryRecommendation.evidence.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div style={decisionStatus} aria-live="polite">
            <span>Decision status</span>
            <strong>{evidenceRecord?.decision_state || "PENDING"}</strong>
          </div>

          <div style={actions}>
            <button type="button" disabled={saving} onClick={() => void decide("ACCEPTED", true)} style={primaryAction}>
              {saving ? "Saving…" : `Accept & ${snapshot.primaryRecommendation.actionLabel}`}
            </button>
            <button type="button" disabled={saving} onClick={() => void decide("REJECTED")} style={secondaryAction}>
              Not this play
            </button>
            {evidenceRecord?.decision_state === "ACCEPTED" ? (
              <button type="button" disabled={saving} onClick={() => void decide("COMPLETED")} style={secondaryAction}>
                Mark outcome complete
              </button>
            ) : null}
          </div>
          <p style={humanAgency}>Playbook recommends. You decide. Your choice is recorded so future guidance can measure what actually helped.</p>
        </section>

        <PlaybookGrid min={300}>
          {readinessAreas.map((area) => (
            <PlaybookCard key={`${area.href}-${area.label}`} eyebrow={area.label} title={area.title}>
              <p style={body}>{area.body}</p>
              <PlaybookButton href={area.href}>{area.action}</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 };
const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 700 };
const errorState: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 16, border: "1px solid #F5B7B1", borderRadius: 16, background: "#FFF5F4", color: "#7F1D1D", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" };
const retryButton: React.CSSProperties = { border: 0, borderRadius: 999, padding: "8px 12px", background: "#7F1D1D", color: "white", fontWeight: 800, cursor: "pointer" };
const loop: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", overflow: "hidden", color: "#F8FAFC", background: "linear-gradient(115deg,#102A4A,#102238 60%,#2B1838)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px 30px 8px 30px" };
const loopStep: React.CSSProperties = { display: "grid", gridTemplateColumns: "42px 1fr", gap: 12, padding: 22, borderRight: "1px solid rgba(255,255,255,.1)" };
const numberStyle: React.CSSProperties = { color: "#FF9D5C", fontWeight: 950, fontSize: 17 };
const loopLabel: React.CSSProperties = { fontSize: 18 };
const loopDetail: React.CSSProperties = { margin: "5px 0 0", color: "#C9D8E8", fontSize: 13, lineHeight: 1.45 };
const recommendationShell: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 22px", padding: "clamp(22px,4vw,38px)", borderRadius: 26, background: "#FFFFFF", border: "1px solid #DDE6EF", boxShadow: "0 18px 60px rgba(15,23,42,.08)" };
const recommendationHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" };
const eyebrow: React.CSSProperties = { margin: "0 0 8px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 900, color: "#D65F1F" };
const recommendationTitle: React.CSSProperties = { margin: 0, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.02, color: "#102238", maxWidth: 760 };
const confidenceBadge: React.CSSProperties = { borderRadius: 999, padding: "9px 12px", background: "#EDF8F2", color: "#146C43", fontSize: 12, fontWeight: 900 };
const recommendationBody: React.CSSProperties = { maxWidth: 820, margin: "18px 0", color: "#52657B", lineHeight: 1.7, fontSize: 16 };
const evidenceBox: React.CSSProperties = { borderRadius: 18, padding: 18, background: "#F5F8FB", color: "#102238" };
const evidenceList: React.CSSProperties = { margin: "10px 0 0 18px", padding: 0, color: "#52657B", lineHeight: 1.65 };
const decisionStatus: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18, paddingTop: 18, borderTop: "1px solid #E6EDF4", color: "#52657B" };
const primaryAction: React.CSSProperties = { border: 0, borderRadius: 999, padding: "12px 18px", background: "#102238", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const secondaryAction: React.CSSProperties = { border: "1px solid #CBD8E4", borderRadius: 999, padding: "12px 18px", background: "#FFFFFF", color: "#102238", fontWeight: 900, cursor: "pointer" };
const humanAgency: React.CSSProperties = { margin: "14px 0 0", color: "#718399", fontSize: 12, lineHeight: 1.6 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "0 0 20px" };
