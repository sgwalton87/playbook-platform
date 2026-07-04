"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookHero,
  PlaybookMetric,
  PlaybookPage,
} from "@/components/ui";

export default function DashboardPage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Dashboard"
        title="Today’s intelligence."
        subtitle="Your next actions, support-network signals, messages, recommendations, and Scholar Record updates."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/messages">Open Inbox</PlaybookButton>
          <PlaybookButton href="/notifications" variant="secondary">Notifications</PlaybookButton>
        </div>
      </PlaybookHero>

      <section style={metrics}>
        <PlaybookMetric label="Network Health" value="86%" />
        <PlaybookMetric label="Unread Signals" value="5" />
        <PlaybookMetric label="Shared Actions" value="3" />
        <PlaybookMetric label="Opportunities" value="14" />
      </section>

      <section style={grid}>
        <PlaybookCard eyebrow="Compass" title="Today’s Guidance">
          <p style={body}>Complete one open support action to improve readiness and unlock stronger recommendations.</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="Scholar Network" title="Support system active">
          <p style={body}>Family, mentor, educator, and athlete support workflows are connected to the Scholar Record.</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="Role OS" title="Choose your command center">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PlaybookButton href="/family-os">Family</PlaybookButton>
            <PlaybookButton href="/mentor-os">Mentor</PlaybookButton>
            <PlaybookButton href="/scholar-athlete-os">Athlete</PlaybookButton>
          </div>
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
  gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
  gap: 16,
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
