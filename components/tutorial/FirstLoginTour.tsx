"use client";

import { getFirstLoginTutorial, getTutorialProgress } from "@/lib/tutorial";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";

export default function FirstLoginTour() {
  const steps = getFirstLoginTutorial();
  const progress = getTutorialProgress(["home", "record"]);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="First Login Tutorial" title="Learn Playbook in five steps." subtitle="A guided walkthrough helps every user understand where to go and what to do next." />
      <PlaybookMetrics>
        <PlaybookMetric label="Tutorial Progress" value={`${progress}%`} />
        <PlaybookMetric label="Steps" value={String(steps.length)} />
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
