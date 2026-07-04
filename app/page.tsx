"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookHero,
  PlaybookMetric,
  PlaybookPage,
} from "@/components/ui";

export default function HomePage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Playbook OS"
        title="The Education Intelligence Operating System."
        subtitle="One platform for scholars, families, educators, mentors, districts, universities, employers, and scholar-athletes."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/login">Enter Playbook</PlaybookButton>
          <PlaybookButton href="/demo" variant="secondary">View Demo</PlaybookButton>
        </div>
      </PlaybookHero>

      <section style={metrics}>
        <PlaybookMetric label="Role OS Experiences" value="8" />
        <PlaybookMetric label="Connected Ecosystem" value="Live" />
        <PlaybookMetric label="Intelligence Layer" value="Active" />
        <PlaybookMetric label="Scholar Network" value="Built" />
      </section>

      <section style={grid}>
        <PlaybookCard eyebrow="Learner Intelligence" title="Living Scholar Record">
          <p style={body}>Academic DNA, Compass guidance, goals, opportunities, evidence, and support-network coordination.</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="Connected Ecosystem" title="Support network in one place">
          <p style={body}>Invites, permissions, messaging, shared actions, notifications, and role-aware intelligence.</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="Scholar-Athlete OS" title="Eligibility, recruiting, NIL">
          <p style={body}>A specialized command center for academic eligibility, athletic recruiting, NIL deals, and financial readiness.</p>
        </PlaybookCard>
      </section>
    </PlaybookPage>
  );
}

const metrics: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 14,
};

const grid: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 16,
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
