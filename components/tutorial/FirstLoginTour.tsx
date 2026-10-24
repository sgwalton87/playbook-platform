"use client";

import { getFirstLoginTutorial } from "@/lib/tutorial";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";

export default function FirstLoginTour() {
  const steps = getFirstLoginTutorial();

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="First Login Tutorial" title="Explore Playbook in five modules." subtitle="Select any module to open the actual tool. Progress is not presented until completion can be verified." />
      <PlaybookMetrics>
        <PlaybookMetric label="Available guided modules" value={String(steps.length)} />
      </PlaybookMetrics>
      <PlaybookGrid>
        {steps.map((step) => (
          <PlaybookCard key={step.id} eyebrow="Tutorial Step" title={step.title}>
            <p style={{ color: "#64748B", lineHeight: 1.6 }}>{step.body}</p>
            <PlaybookButton href={step.href}>Open</PlaybookButton>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}
