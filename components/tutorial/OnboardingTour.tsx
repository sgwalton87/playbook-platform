"use client";

import { getFirstLoginTutorial, getTutorialProgress } from "@/lib/tutorial";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";

export default function OnboardingTour({ onComplete, saving = false }: { onComplete?: () => void; saving?: boolean }) {
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
      {onComplete && (
        <div style={{ maxWidth: 1180, margin: "18px auto 0" }}>
          <button onClick={onComplete} disabled={saving} style={finishButton}>
            {saving ? "Saving..." : "Finish Tutorial"}
          </button>
        </div>
      )}
    </PlaybookPage>
  );
}

const finishButton: React.CSSProperties = { border: "none", borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "12px 18px", fontWeight: 950, cursor: "pointer" };
