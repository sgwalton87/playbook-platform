"use client";

import {
  buildBeta33ApplicationJourney,
  getBeta33CompletionChecklist,
  getBeta33CompletionStatus,
} from "@/lib/beta33-completion";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function Beta33CompletionPage() {
  const status = getBeta33CompletionStatus();
  const checklist = getBeta33CompletionChecklist();
  const journey = buildBeta33ApplicationJourney();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Beta 3.3 Completion"
        title="Opportunity Application Toolkit is ready for completion stamp."
        subtitle="Resume, recommendations, brag sheets, portfolio packets, PDF rendering, shareable links, recommender workflow, and application workspaces are now connected as one application toolkit."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Status" value={status.label} />
        <PlaybookMetric label="Completion" value={`${status.percent}%`} />
        <PlaybookMetric label="Gates" value={`${status.complete}/${status.total}`} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Completion Gates" title="Beta 3.3 checklist">
          {checklist.map((item) => (
            <p key={item.item} style={row}>
              ✓ {item.item}
            </p>
          ))}
          <PlaybookPill>{status.label}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="End-to-End Journey" title="Application workflow">
          {journey.map((item) => (
            <p key={item} style={row}>
              ✓ {item}
            </p>
          ))}
          <PlaybookPill>journey modeled</PlaybookPill>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const row: React.CSSProperties = {
  color: "#334155",
  fontWeight: 800,
  lineHeight: 1.5,
};
