"use client";

import {
  getResponsiveQaChecklist,
  getUnifiedExperienceRoutes,
  getVisualQaStatus,
} from "@/lib/visual-qa";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";

export default function VisualQAPage() {
  const status = getVisualQaStatus();
  const checklist = getResponsiveQaChecklist();
  const routes = getUnifiedExperienceRoutes();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Unified Experience QA"
        title="Responsive and visual consistency checklist."
        subtitle="A single QA surface for mobile behavior, shared primitives, and route consistency."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="QA Completion" value={`${status.percent}%`} />
        <PlaybookMetric label="Routes" value={String(routes.length)} />
        <PlaybookMetric label="Checks" value={String(checklist.length)} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Responsive Checklist" title="Mobile + layout">
          {checklist.map((item) => (
            <p key={item} style={row}>✓ {item}</p>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Route Checklist" title="Unified routes">
          {routes.map((route) => (
            <p key={route} style={row}>✓ {route}</p>
          ))}
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const row: React.CSSProperties = {
  color: "#334155",
  fontWeight: 800,
};
