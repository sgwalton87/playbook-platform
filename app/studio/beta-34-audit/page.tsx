"use client";

import {
  getBeta34AuditChecklist,
  getBeta34AuditRoutes,
  getBeta34AuditStatus,
} from "@/lib/beta34-audit";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";

export default function Beta34AuditPage() {
  const status = getBeta34AuditStatus();
  const checklist = getBeta34AuditChecklist();
  const routes = getBeta34AuditRoutes();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Beta 3.4 Completion Audit"
        title="Guided Experience + Gamification Economy audit."
        subtitle="A full checkpoint for routes, pathways, rewards, store, brand partners, NIL campaign foundations, and unified navigation."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Completion" value={`${status.percent}%`} />
        <PlaybookMetric label="Checks" value={`${status.complete}/${status.total}`} />
        <PlaybookMetric label="Routes" value={String(routes.length)} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Audit Checklist" title="Completion gates">
          {checklist.map((item) => (
            <p key={item} style={row}>✓ {item}</p>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Route Audit" title="Pages to manually click-test">
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
