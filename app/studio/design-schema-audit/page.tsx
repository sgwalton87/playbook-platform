"use client";

import {
  getDesignSchemaRoutes,
  summarizeDesignSchema,
} from "@/lib/design-schema";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function DesignSchemaAuditPage() {
  const routes = getDesignSchemaRoutes();
  const summary = summarizeDesignSchema();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Design Schema Audit"
        title="One platform. One visual language."
        subtitle="This audit classifies every major page as Current Schema, Legacy Schema, or Special Experience so we can update the platform systematically."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Current" value={String(summary["Current Schema"])} />
        <PlaybookMetric label="Legacy" value={String(summary["Legacy Schema"])} />
        <PlaybookMetric label="Special" value={String(summary["Special Experience"])} />
      </PlaybookMetrics>

      <PlaybookGrid>
        {routes.map((route) => (
          <PlaybookCard key={route.route} eyebrow={route.status} title={route.label}>
            <p style={body}>{route.notes}</p>
            <a href={route.route.replace("[slug]", "captains-mindset").replace("[username]", "Founder")} style={link}>
              Open {route.route}
            </a>
            <div style={{ marginTop: 12 }}>
              <PlaybookPill>{route.route}</PlaybookPill>
            </div>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const link: React.CSSProperties = {
  color: "#F97316",
  fontWeight: 900,
  textDecoration: "none",
};
