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
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import type { PlaybookRoleOS } from "@/lib/role-os";

export default function RoleDashboardExperience({
  role,
}: {
  role: PlaybookRoleOS;
}) {
  const dashboard = getRoleDashboard(role);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow={`${role} OS`}
        title={dashboard.title}
        subtitle={dashboard.description}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/role-intelligence">Open Role Intelligence</PlaybookButton>
          <PlaybookButton href="/messages" variant="secondary">Messages</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        {dashboard.metrics.map((metric) => <PlaybookMetric key={metric.label} label={metric.label} value={metric.value} />)}
      </PlaybookMetrics>

      <PlaybookGrid min={300}>
        {dashboard.cards.map((card) => (
          <PlaybookCard key={card.title} eyebrow={card.label || "Role OS"} title={card.title}>
            <p style={body}>{card.body}</p>
            <PlaybookButton href={card.href}>{card.action}</PlaybookButton>
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
