"use client";

import AGTracker from "@/components/ag/AGTracker";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";

export default function DashboardPage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Scholar Dashboard"
        title="Your transcript is the starting point."
        subtitle="Upload your transcript, see A–G readiness, close gaps with Compass, and activate your support network."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/transcript">Upload Transcript</PlaybookButton>
          <PlaybookButton href="/compass" variant="secondary">Open Compass Plan</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Academic Core" value="Active" />
        <PlaybookMetric label="A-G Tracker" value="Live" />
        <PlaybookMetric label="Transcript Upload" value="Ready" />
        <PlaybookMetric label="Next Step" value="Compass" />
      </PlaybookMetrics>

      <div style={mainGrid}>
        <section>
          <AGTracker />
        </section>

        <section style={sideStack}>
          <PlaybookCard eyebrow="Start Here" title="Upload your transcript">
            <p style={body}>
              This powers A–G readiness, graduation planning, scholar-athlete
              eligibility, opportunity matching, applications, and support actions.
            </p>
            <PlaybookButton href="/transcript">Go to Transcript</PlaybookButton>
          </PlaybookCard>

          <PlaybookCard eyebrow="Compass" title="Turn gaps into action">
            <p style={body}>
              After A–G results are visible, Compass will prioritize what needs
              to happen next and who can help.
            </p>
            <PlaybookButton href="/compass">Open Compass</PlaybookButton>
          </PlaybookCard>

          <PlaybookCard eyebrow="Support Network" title="Do not do this alone">
            <p style={body}>
              Invite family, educators, mentors, coaches, and advocates to help
              close academic and opportunity gaps.
            </p>
            <PlaybookButton href="/support-network">Activate Support</PlaybookButton>
          </PlaybookCard>
        </section>
      </div>
    </PlaybookPage>
  );
}

const mainGrid: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .6fr)",
  gap: 18,
  alignItems: "start",
};

const sideStack: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
