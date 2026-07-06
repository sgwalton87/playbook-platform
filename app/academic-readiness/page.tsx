"use client";

import Link from "next/link";
import { PLAYBOOK_HERO_VISUALS } from "@/lib/brand-story";
import { PlaybookHeroVisual } from "@/components/brand-story";

const readinessAreas = [
  {
    title: "Transcript Intelligence",
    description:
      "Upload, review, and maintain the academic record that powers Playbook intelligence.",
    href: "/transcript",
    action: "Open Transcript",
  },
  {
    title: "A–G Readiness",
    description:
      "Understand progress across the seven UC/CSU subject areas and identify missing coursework.",
    href: "/transcript",
    action: "View A–G Tracker",
  },
  {
    title: "Academic DNA",
    description:
      "Translate transcript evidence into strengths, patterns, confidence signals, and readiness insights.",
    href: "/living-scholar",
    action: "View Academic DNA",
  },
  {
    title: "Compass",
    description:
      "Turn academic gaps, deadlines, and readiness risks into prioritized next actions.",
    href: "/compass",
    action: "Open Compass",
  },
  {
    title: "Oracle",
    description:
      "Ask questions about courses, transcript progress, GPA, A–G readiness, and next steps.",
    href: "/studio/oracle",
    action: "Open Oracle",
  },
  {
    title: "Opportunity Matching",
    description:
      "Use academic and Scholar Record evidence to understand which opportunities are becoming reachable.",
    href: "/opportunities",
    action: "Explore Opportunities",
  },
];

export default function AcademicReadinessPage() {
  return (
    <>
      <PlaybookHeroVisual
        image={PLAYBOOK_HERO_VISUALS.academicReadiness.image}
        alt={PLAYBOOK_HERO_VISUALS.academicReadiness.alt}
      />

    <main style={page}>
      <section style={hero}>
        <div style={eyebrow}>ACADEMIC READINESS</div>

        <h1 style={title}>
          Your transcript should tell you what to do next.
        </h1>

        <p style={subtitle}>
          Playbook connects transcript evidence to A–G readiness, graduation
          progress, academic strengths, risks, opportunities, and coordinated
          support.
        </p>

        <div style={actions}>
          <Link href="/transcript" style={primaryButton}>
            Upload or Review Transcript
          </Link>

          <Link href="/start" style={secondaryButton}>
            View My Journey
          </Link>
        </div>
      </section>

      <section style={content}>
        <div style={callout}>
          <div>
            <div style={calloutEyebrow}>THE CORE LOOP</div>
            <h2 style={calloutTitle}>
              Evidence → Intelligence → Action → Support
            </h2>
          </div>

          <p style={calloutBody}>
            Academic information should not sit in a file. Playbook turns it
            into understandable progress, identified gaps, next actions, and
            coordinated support.
          </p>
        </div>

        <div style={grid}>
          {readinessAreas.map((area) => (
            <article key={area.title} style={card}>
              <h2 style={cardTitle}>{area.title}</h2>
              <p style={cardBody}>{area.description}</p>

              <Link href={area.href} style={cardLink}>
                {area.action} →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
    </>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F8F7F4",
};

const hero: React.CSSProperties = {
  padding: "52px clamp(20px, 5vw, 72px)",
  background: "#0F172A",
  color: "#F8F7F4",
};

const eyebrow: React.CSSProperties = {
  color: "#F4B942",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".18em",
  marginBottom: 14,
};

const title: React.CSSProperties = {
  fontSize: "clamp(38px, 5vw, 62px)",
  lineHeight: 1.04,
  letterSpacing: "-.045em",
  maxWidth: 850,
  margin: 0,
};

const subtitle: React.CSSProperties = {
  maxWidth: 720,
  lineHeight: 1.7,
  color: "rgba(248,247,244,.7)",
  fontSize: 17,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 24,
};

const primaryButton: React.CSSProperties = {
  background: "#F4B942",
  color: "#0F172A",
  padding: "13px 17px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.2)",
  color: "#F8F7F4",
  padding: "13px 17px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 800,
};

const content: React.CSSProperties = {
  padding: "36px clamp(20px, 5vw, 72px) 72px",
};

const callout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
};

const calloutEyebrow: React.CSSProperties = {
  color: "#64748B",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".16em",
};

const calloutTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 26,
  margin: "8px 0 0",
};

const calloutBody: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.7,
  margin: 0,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 20,
  padding: 22,
  minHeight: 210,
  display: "flex",
  flexDirection: "column",
};

const cardTitle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 21,
  margin: 0,
};

const cardBody: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.65,
  flex: 1,
};

const cardLink: React.CSSProperties = {
  color: "#0F172A",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 13,
};
