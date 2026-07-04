"use client";

import { getBeta34Status } from "@/lib/beta34";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function Beta34Dashboard() {
  const status = getBeta34Status();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow={status.phase}
        title={status.name}
        subtitle="This phase makes Playbook easier to learn, more rewarding to use, and ready for a real student-facing economy."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Status" value={status.status.replaceAll("_", " ")} />
        <PlaybookMetric label="Pillars" value={String(status.pillars.length)} />
      </PlaybookMetrics>

      <PlaybookGrid>
        {status.pillars.map((pillar) => (
          <PlaybookCard key={pillar} eyebrow="Beta 3.4 Pillar" title={pillar}>
            <p style={{ color: "#64748B", lineHeight: 1.6 }}>
              Foundation ready for implementation.
            </p>
            <PlaybookPill>planned</PlaybookPill>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}
