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

export default function FounderPage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Founder Command Center"
        title="Build, inspect, and ship Playbook OS."
        subtitle="Founder mode separates product inspection and release tools from the scholar-facing experience."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Operator access" value="Verified" />
        <PlaybookMetric label="System health" value="Not connected" />
        <PlaybookMetric label="Release status" value="Not connected" />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Studio" title="Inspect platform systems">
          <PlaybookButton href="/studio">Open Studio</PlaybookButton>
        </PlaybookCard>

        <PlaybookCard eyebrow="Audit" title="Review Beta 3.4 readiness">
          <PlaybookButton href="/studio/beta-34-audit">Open Audit</PlaybookButton>
        </PlaybookCard>

        <PlaybookCard eyebrow="Demo" title="Founder case study">
          <PlaybookButton href="/demo/founder-case-study">Open Demo</PlaybookButton>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}
