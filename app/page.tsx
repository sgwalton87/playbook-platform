"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";

export default function HomePage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Playbook Series"
        title="A college, career, and life-readiness operating system."
        subtitle="Playbook helps scholars build their record, complete courses, earn coins, invite their support network, prepare applications, and move toward college, career, athletics, and financial freedom."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/login">Start Now</PlaybookButton>
          <PlaybookButton href="/demo" variant="secondary">View Demo</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Role OS Experiences" value="8" />
        <PlaybookMetric label="Scholar Network" value="Connected" />
        <PlaybookMetric label="Coins + Store" value="Active" />
        <PlaybookMetric label="Applications" value="Toolkit" />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="For Scholars" title="Build your future record">
          <p style={body}>Track academics, goals, courses, certificates, applications, evidence, opportunities, and milestones.</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="For Support Networks" title="Bring everyone into one ecosystem">
          <p style={body}>Families, mentors, educators, districts, universities, employers, and coaches coordinate around the same scholar.</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="For Scholar-Athletes" title="Eligibility, recruiting, NIL, and finance">
          <p style={body}>Support academic eligibility, recruiting pipelines, NIL readiness, financial literacy, and brand-partner opportunities.</p>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
