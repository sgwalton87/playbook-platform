"use client";

import { useEffect, useMemo, useState } from "react";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import {
  buildAthleteNextActions,
  getNILPortfolioSummary,
  getRecruitingPipelineSummary,
} from "@/lib/scholar-athlete";
import type { NILDeal, RecruitingTarget } from "@/lib/scholar-athlete";
import { supabase } from "@/lib/supabaseClient";

const journeyCards = [
  {
    eyebrow: "Eligibility intelligence",
    title: "Protect your eligibility",
    body: "Bring grades, credits, requirements, and verification evidence into one readiness view.",
    href: "/academic-readiness",
    action: "Review readiness",
  },
  {
    eyebrow: "Academic record",
    title: "Turn your transcript into a plan",
    body: "See the courses, milestones, and evidence shaping your path to graduation and college.",
    href: "/transcript",
    action: "Open transcript",
  },
  {
    eyebrow: "Recruiting command center",
    title: "Own your recruiting pipeline",
    body: "Move from discovery to coach conversations, visits, offers, and informed decisions.",
    href: "/opportunities",
    action: "Explore opportunities",
  },
  {
    eyebrow: "Athlete Abroad",
    title: "Build a global playing future",
    body: "Explore international pathways while keeping academics, eligibility, and support connected.",
    href: "/courses/athletes-abroad-global-hub",
    action: "Explore globally",
  },
  {
    eyebrow: "NIL & financial intelligence",
    title: "Build value that lasts",
    body: "Prepare for responsible partnerships, compensation, taxes, saving, and long-term ownership.",
    href: "/financial-intelligence",
    action: "Build my foundation",
  },
  {
    eyebrow: "Support network",
    title: "Keep your people in the play",
    body: "Coordinate family, coaches, mentors, counselors, and trusted supporters around the next move.",
    href: "/support-network",
    action: "Open support network",
  },
] as const;

export default function ScholarAthleteDashboard() {
  const [targets, setTargets] = useState<RecruitingTarget[]>([]);
  const [deals, setDeals] = useState<NILDeal[]>([]);
  const [eligibilityStatus, setEligibilityStatus] = useState<string | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [dataState, setDataState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    async function loadAthleteRecord() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        setDataState("error");
        return;
      }
      const [targetResult, dealResult, eligibilityResult, visitResult] = await Promise.all([
        supabase.from("recruiting_targets").select("*").eq("scholar_id", auth.user.id),
        supabase.from("nil_deals").select("*").eq("scholar_id", auth.user.id),
        supabase.from("athlete_eligibility_checks").select("status").eq("scholar_id", auth.user.id).order("checked_at", { ascending: false }).limit(1),
        supabase.from("recruiting_visits").select("id").eq("scholar_id", auth.user.id),
      ]);
      if (!active) return;
      if (targetResult.error || dealResult.error || eligibilityResult.error || visitResult.error) {
        setDataState("error");
        return;
      }
      setTargets((targetResult.data || []).map((target) => ({
        id: target.id,
        schoolName: target.school_name,
        athleticProgram: target.athletic_program || undefined,
        division: target.division || undefined,
        coachName: target.coach_name || undefined,
        coachEmail: target.coach_email || undefined,
        stage: target.stage,
        nextAction: target.next_action || undefined,
        nextActionDueAt: target.next_action_due_at || undefined,
        notes: target.notes || undefined,
      })) as RecruitingTarget[]);
      setDeals((dealResult.data || []).map((deal) => ({
        id: deal.id,
        brandName: deal.brand_name,
        opportunityTitle: deal.opportunity_title,
        stage: deal.stage,
        compensationType: deal.compensation_type || undefined,
        compensationAmount: deal.compensation_amount == null ? undefined : Number(deal.compensation_amount),
        deliverables: Array.isArray(deal.deliverables) ? deal.deliverables : [],
        contractStatus: deal.contract_status,
        disclosureStatus: deal.disclosure_status,
        paymentStatus: deal.payment_status,
      })) as NILDeal[]);
      setEligibilityStatus(eligibilityResult.data?.[0]?.status || null);
      setVisitCount((visitResult.data || []).length);
      setDataState("ready");
    }
    void loadAthleteRecord();
    return () => { active = false; };
  }, []);

  const recruiting = useMemo(() => getRecruitingPipelineSummary(targets), [targets]);
  const nil = useMemo(() => getNILPortfolioSummary(deals), [deals]);
  const actions = dataState === "ready"
    ? buildAthleteNextActions({
        eligibilityStatus,
        recruitingTargets: recruiting.total,
        activeDeals: nil.activeDeals,
        financialPlanComplete: null,
      })
    : [];

  return (
    <PlaybookPage>
      <div data-testid="scholar-athlete-os" data-visual-canon="PGSA-001">
        <PlaybookHero
          eyebrow="Scholar-Athlete OS"
          title="Build the student. Build the athlete. Build the future."
          subtitle="One connected command center for academics, eligibility, recruiting, NIL, money, wellness, and the people helping you move forward."
        >
          <div style={heroActions}>
            <PlaybookButton href="/academic-readiness">See my next play</PlaybookButton>
            <PlaybookButton href="/opportunities" variant="secondary">Explore opportunities</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={statusRail} aria-label="Scholar-Athlete status">
          <div>
            <PlaybookPill>Live journey foundation</PlaybookPill>
            <h2 style={statusTitle}>Your whole journey, one play at a time.</h2>
          </div>
          <p style={statusCopy} role={dataState === "error" ? "alert" : undefined}>
            {dataState === "loading" && "Connecting your private eligibility, recruiting, and NIL records…"}
            {dataState === "ready" && "Your private athlete record is connected. Empty totals mean no verified activity is recorded yet—no demo activity is presented as yours."}
            {dataState === "error" && "Your athlete records are temporarily unavailable. Nothing has been changed; try again after refreshing or contact your support team."}
          </p>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Eligibility" value={metricValue(dataState, eligibilityStatus ? formatStatus(eligibilityStatus) : "Not assessed")} />
          <PlaybookMetric label="Recruiting targets" value={metricValue(dataState, `${recruiting.total} recorded`)} />
          <PlaybookMetric label="Recruiting visits" value={metricValue(dataState, `${visitCount ?? 0} recorded`)} />
          <PlaybookMetric label="NIL partnerships" value={metricValue(dataState, `${nil.activeDeals} active`)} />
        </PlaybookMetrics>

        <PlaybookGrid min={300}>
          {journeyCards.map((journey) => (
            <PlaybookCard key={journey.href} eyebrow={journey.eyebrow} title={journey.title}>
              <p style={body}>{journey.body}</p>
              <PlaybookButton href={journey.href}>{journey.action}</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>

        <section style={compassSection}>
          <div style={compassHeading}>
            <div>
              <p style={eyebrow}>Athlete Compass</p>
              <h2 style={sectionTitle}>Your next best actions</h2>
            </div>
            <PlaybookButton href="/messages" variant="secondary">Message my team</PlaybookButton>
          </div>
          <div style={actionGrid}>
            {actions.map((action, index) => (
              <article key={action.title} style={actionCard}>
                <span style={actionNumber}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span style={severity}>{action.severity}</span>
                  <h3 style={actionTitle}>{action.title}</h3>
                  <p style={body}>{action.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PlaybookPage>
  );
}

function metricValue(state: "loading" | "ready" | "error", readyValue: string) {
  if (state === "loading") return "…";
  if (state === "error") return "Unavailable";
  return readyValue;
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const statusRail: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  padding: "22px clamp(20px,4vw,34px)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  alignItems: "center",
  gap: 20,
  color: "#F8FAFC",
  background: "linear-gradient(115deg,#102A4A,#102238 60%,#2B1838)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "8px 30px 8px 30px",
};
const statusTitle: React.CSSProperties = { margin: "12px 0 0", fontSize: "clamp(25px,4vw,38px)", lineHeight: 1.05 };
const statusCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.65 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "0 0 20px" };
const compassSection: React.CSSProperties = {
  maxWidth: 1180,
  margin: "18px auto 0",
  padding: "clamp(22px,4vw,36px)",
  color: "#F8FAFC",
  background: "linear-gradient(145deg,#06172D,#0B2648)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: "30px 8px 30px 8px",
};
const compassHeading: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 18 };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const sectionTitle: React.CSSProperties = { margin: "9px 0 0", fontSize: "clamp(30px,5vw,48px)", lineHeight: 1 };
const actionGrid: React.CSSProperties = { display: "grid", gap: 12, marginTop: 24 };
const actionCard: React.CSSProperties = { display: "grid", gridTemplateColumns: "44px minmax(0,1fr)", gap: 15, padding: 18, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "18px 5px 18px 5px" };
const actionNumber: React.CSSProperties = { color: "#FF9D5C", fontSize: 19, fontWeight: 950 };
const actionTitle: React.CSSProperties = { margin: "9px 0 4px", color: "#FFFFFF", fontSize: 21 };
const severity: React.CSSProperties = { display: "inline-flex", color: "#FFD5B7", fontSize: 10, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" };
