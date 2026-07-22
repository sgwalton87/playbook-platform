"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildAcademicIntelligenceReport, buildAcademicDNA } from "@/lib/academic-intelligence";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { buildCompassReport } from "@/lib/compass";
import { askOracle } from "@/lib/oracle";

const demoCourses = [
  { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
  { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
  { name: "English 9", subject: "english", credits: 10, grade: "A", completed: true },
];

const steps = [
  "Onboard",
  "Transcript",
  "Academic DNA",
  "Opportunities",
  "Compass",
  "Oracle",
  "Evidence",
  "Home",
];

export default function FirstJourney() {
  const [active, setActive] = useState(0);
  const [savedOpportunity, setSavedOpportunity] = useState(false);
  const [evidenceAdded, setEvidenceAdded] = useState(false);

  const academic = useMemo(() => buildAcademicIntelligenceReport(demoCourses), []);
  const dna = useMemo(() => buildAcademicDNA(demoCourses), []);
  const opportunities = useMemo(() => matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  }), [dna]);
  const compass = useMemo(() => buildCompassReport({ courses: demoCourses, trustScore: evidenceAdded ? 78 : 62 }), [evidenceAdded]);
  const oracle = useMemo(() => askOracle({
    question: "What scholarships match this student?",
    courses: demoCourses,
    trustScore: evidenceAdded ? 78 : 62,
  }), [evidenceAdded]);

  const progress = Math.round(((active + 1) / steps.length) * 100);

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>First Complete User Journey</p>
        <h1 style={title}>From signup to smart guidance.</h1>
        <p style={sub}>
          This demo walks through the learner journey: onboarding, transcript intelligence, Academic DNA, Opportunity Graph, Compass, Oracle, evidence, and Playbook Home.
        </p>

        <div style={progressTrack}>
          <div style={{ ...progressFill, width: `${progress}%` }} />
        </div>
        <strong style={{ color: "#F97316" }}>{progress}% journey complete</strong>
      </section>

      <section style={stepNav}>
        {steps.map((step, index) => (
          <button
            key={step}
            onClick={() => setActive(index)}
            style={{
              ...stepButton,
              background: active === index ? "#0F172A" : "#fff",
              color: active === index ? "#fff" : "#0F172A",
            }}
          >
            {index + 1}. {step}
          </button>
        ))}
      </section>

      <section style={card}>
        {active === 0 && (
          <JourneyPanel
            label="Step 1"
            title="Scholar onboarding complete"
            body="The learner creates an account, completes role-based onboarding, and enters Playbook Home."
            action={<Link href="/start" style={primaryBtn}>View onboarding →</Link>}
          />
        )}

        {active === 1 && (
          <JourneyPanel
            label="Step 2"
            title="Transcript imported"
            body={`Transcript Intelligence found ${academic.creditsEarned} credits, ${academic.agProgress}% A-G progress, and ${academic.graduationProgress}% graduation progress.`}
            action={<Link href="/transcript" style={primaryBtn}>Open transcript →</Link>}
          />
        )}

        {active === 2 && (
          <JourneyPanel
            label="Step 3"
            title="Academic DNA generated"
            body={`Playbook detected ${dna.strengths.length} strengths, ${dna.interests.length} interest pathways, and ${dna.confidence}% confidence.`}
            action={
              <div style={chips}>
                {dna.strengths.slice(0, 5).map(s => <span key={s} style={chip}>{s}</span>)}
              </div>
            }
          />
        )}

        {active === 3 && (
          <JourneyPanel
            label="Step 4"
            title="Opportunities matched"
            body={`Opportunity Graph found ${opportunities.matches.length} matches with an average score of ${opportunities.score}%.`}
            action={
              <div style={{ display: "grid", gap: 10 }}>
                {opportunities.matches.slice(0, 3).map(match => (
                  <button
                    key={match.opportunity.id}
                    onClick={() => setSavedOpportunity(true)}
                    style={oppButton}
                  >
                    <strong>{match.opportunity.title}</strong>
                    <span>{savedOpportunity ? "Saved ✓" : `${match.score}% match — save`}</span>
                  </button>
                ))}
              </div>
            }
          />
        )}

        {active === 4 && (
          <JourneyPanel
            label="Step 5"
            title="Compass briefing created"
            body={compass.summary}
            action={
              <ul style={list}>
                {compass.nextActions.slice(0, 4).map(action => <li key={action}>{action}</li>)}
              </ul>
            }
          />
        )}

        {active === 5 && (
          <JourneyPanel
            label="Step 6"
            title="Oracle answers a question"
            body={oracle.answer}
            action={
              <div style={chips}>
                {oracle.evidence.slice(0, 4).map(e => <span key={e} style={chip}>{e}</span>)}
              </div>
            }
          />
        )}

        {active === 6 && (
          <JourneyPanel
            label="Step 7"
            title="Evidence added to Scholar Record"
            body={evidenceAdded ? "Evidence added. Trust and Compass signals improved." : "Add evidence to strengthen the learner's Playbook Record and Trust Layer."}
            action={<button onClick={() => setEvidenceAdded(true)} style={primaryBtn}>{evidenceAdded ? "Evidence Added ✓" : "Add Evidence"}</button>}
          />
        )}

        {active === 7 && (
          <JourneyPanel
            label="Step 8"
            title="Playbook Home evolves"
            body="The learner returns home and sees updated guidance, stronger trust signals, saved opportunities, and a clearer next step."
            action={<Link href="/home" style={primaryBtn}>Open Playbook Home →</Link>}
          />
        )}
      </section>
    </main>
  );
}

function JourneyPanel({ label, title, body, action }: any) {
  return (
    <>
      <p style={eyebrow}>{label}</p>
      <h2 style={panelTitle}>{title}</h2>
      <p style={panelBody}>{body}</p>
      <div style={{ marginTop: 20 }}>{action}</div>
    </>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", padding: 32, fontFamily: "system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth: 1100, margin: "0 auto 18px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: 28 };
const eyebrow: React.CSSProperties = { color: "#F97316", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 900 };
const title: React.CSSProperties = { fontSize: 46, lineHeight: 1, margin: "8px 0", color: "#0F172A" };
const sub: React.CSSProperties = { color: "#64748B", fontSize: 15, lineHeight: 1.6, maxWidth: 760 };
const progressTrack: React.CSSProperties = { height: 10, background: "#E2E8F0", borderRadius: 999, overflow: "hidden", margin: "18px 0 8px" };
const progressFill: React.CSSProperties = { height: "100%", background: "#F97316", borderRadius: 999, transition: "width .35s ease" };
const stepNav: React.CSSProperties = { maxWidth: 1100, margin: "0 auto 18px", display: "flex", gap: 8, flexWrap: "wrap" };
const stepButton: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 999, padding: "9px 12px", fontWeight: 800, cursor: "pointer" };
const card: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 28, padding: 30, minHeight: 300 };
const panelTitle: React.CSSProperties = { fontSize: 34, color: "#0F172A", margin: "8px 0" };
const panelBody: React.CSSProperties = { fontSize: 16, color: "#64748B", lineHeight: 1.65, maxWidth: 760 };
const primaryBtn: React.CSSProperties = { background: "#F97316", color: "#fff", border: "none", borderRadius: 999, padding: "12px 16px", fontWeight: 900, textDecoration: "none", cursor: "pointer", display: "inline-flex" };
const chips: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const chip: React.CSSProperties = { border: "1px solid #FED7AA", background: "#FFF7ED", color: "#F97316", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 800 };
const oppButton: React.CSSProperties = { border: "1px solid #E2E8F0", background: "#fff", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", gap: 12, cursor: "pointer", color: "#0F172A" };
const list: React.CSSProperties = { color: "#64748B", lineHeight: 1.7 };
