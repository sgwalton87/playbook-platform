"use client";

import RoleAuthorityGate from "@/components/role-os/RoleAuthorityGate";
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
  authorityVerified = false,
}: {
  role: PlaybookRoleOS;
  authorityVerified?: boolean;
}) {
  const dashboard = getRoleDashboard(role);
  const content = (
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
        {dashboard.metrics.map((metric) => (
          <PlaybookMetric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PlaybookMetrics>
      <p role="status" style={metricNotice}>Live role analytics are not connected to a canonical data source yet. Workflow access remains governed by your role and relationships; metrics will not report observed counts until a certified source is connected.</p>

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

  // Mentor OS is always entered through MentorValidationExperience, which has
  // already proved the active Mentor relationship before rendering this shared
  // dashboard. All other role dashboards use the generic authority gate unless
  // a future specialized gate explicitly marks authorityVerified.
  const specializedAuthorityVerified = authorityVerified || role === "mentor";

  return specializedAuthorityVerified
    ? content
    : <RoleAuthorityGate roleOS={role}>{content}</RoleAuthorityGate>;
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const metricNotice: React.CSSProperties = { maxWidth: 1180, margin: "-8px auto 20px", padding: "12px 14px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B", lineHeight: 1.5, fontSize: 12 };
