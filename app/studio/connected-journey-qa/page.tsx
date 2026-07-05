"use client";

import {
  getConnectedJourneyChecks,
  getManualQaPathway,
  summarizeConnectedJourney,
} from "@/lib/connected-journey";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
  PlaybookButton,
} from "@/components/ui";

export default function ConnectedJourneyQaPage() {
  const checks = getConnectedJourneyChecks();
  const summary = summarizeConnectedJourney();
  const pathway = getManualQaPathway();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Connected Journey QA"
        title="Does Playbook feel like one ecosystem?"
        subtitle="This audit verifies the scholar journey from transcript and A-G through Community, Albums, Mentor Connect, Events, Courses, Rewards, Trust, and Founder Demo."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Passing" value={String(summary.pass)} />
        <PlaybookMetric label="Watch" value={String(summary.watch)} />
        <PlaybookMetric label="Needs Fix" value={String(summary.needs_fix)} />
        <PlaybookMetric label="Manual Pathways" value={String(pathway.length)} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Manual QA Pathway" title="Click this order tonight">
          {pathway.map((route) => (
            <p key={route} style={row}>
              <a href={route} style={link}>{route}</a>
            </p>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="QA Principle" title="Connected, not scattered">
          <p style={body}>
            Every page should clearly answer: what is this, what data powers it,
            what should the scholar do next, and where does it connect in the
            broader Playbook journey?
          </p>
          <PlaybookButton href="/dashboard">Start QA</PlaybookButton>
        </PlaybookCard>
      </PlaybookGrid>

      <section style={list}>
        {checks.map((check) => (
          <article key={check.id} style={card}>
            <div>
              <p style={eyebrow}>{check.layer}</p>
              <h2 style={title}>{check.label}</h2>
              <a href={check.route} style={route}>{check.route}</a>
            </div>
            <PlaybookPill>{check.status}</PlaybookPill>
            <p style={body}>{check.expectation}</p>
          </article>
        ))}
      </section>
    </PlaybookPage>
  );
}

const list: React.CSSProperties = {
  maxWidth: 1180,
  margin: "18px auto 0",
  display: "grid",
  gap: 12,
};

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gap: 10,
};

const eyebrow: React.CSSProperties = {
  color: "#64748B",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  margin: 0,
};

const title: React.CSSProperties = {
  color: "#0F172A",
  margin: "4px 0",
};

const route: React.CSSProperties = {
  color: "#F97316",
  fontWeight: 900,
  textDecoration: "none",
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const row: React.CSSProperties = {
  margin: "8px 0",
};

const link: React.CSSProperties = {
  color: "#0F172A",
  fontWeight: 900,
};
