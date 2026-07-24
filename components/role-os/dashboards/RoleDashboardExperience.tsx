"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import PermissionGate from "@/components/permissions/PermissionGate";
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import { buildRoleRecommendations, buildRoleScenarios, explainRoleIntelligence } from "@/lib/role-intelligence";
import { mapRoleToRelationship } from "@/lib/permissions";
import type { PlaybookRoleOS } from "@/lib/role-os";

export default function RoleDashboardExperience({
  role,
}: {
  role: PlaybookRoleOS;
}) {
  const dashboard = getRoleDashboard(role);
  const roleRecommendations = buildRoleRecommendations(role);
  const roleScenario = buildRoleScenarios(role);
  const roleExplanation = explainRoleIntelligence(role);
  const relationship = mapRoleToRelationship(role);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow={`${role} OS`}
        title={dashboard.title}
        subtitle={(dashboard as LegacyValue).description || (dashboard as LegacyValue).greeting || (dashboard as LegacyValue).question || "Role-specific intelligence, actions, and support network coordination."}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/role-intelligence">Open Role Intelligence</PlaybookButton>
          <PlaybookButton href="/messages" variant="secondary">Messages</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        {(dashboard.metrics || []).map((metric: LegacyValue) => { const label = Array.isArray(metric) ? metric[0] : metric.label; const value = Array.isArray(metric) ? metric[1] : metric.value; return (
          <PlaybookMetric key={label} label={label} value={String(value)} />
        ); })}
      </PlaybookMetrics>

      <PlaybookGrid min={300}>
        <PlaybookCard eyebrow="Role Intelligence Active" title="Recommendations for this role">
          <div style={{ display: "grid", gap: 10 }}>
            {roleRecommendations.recommendations.map((item) => (
              <div key={item} style={row}>
                <span style={check}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div style={callout}>
            <strong>Scenario</strong>
            <span>{roleScenario.scenario}</span>
          </div>

          <p style={body}>{roleExplanation}</p>
        </PlaybookCard>

        <PlaybookCard eyebrow="Permission-Aware Access" title="What this relationship can do">
          <div style={{ display: "grid", gap: 10 }}>
            <PermissionGate relationship={relationship} permission="view_progress">
              <div style={row}><span style={check}>✓</span><span>View learner progress</span></div>
            </PermissionGate>

            <PermissionGate relationship={relationship} permission="verify_evidence">
              <div style={row}><span style={check}>✓</span><span>Verify scholar evidence</span></div>
            </PermissionGate>

            <PermissionGate relationship={relationship} permission="create_opportunities">
              <div style={row}><span style={check}>✓</span><span>Create opportunity pathways</span></div>
            </PermissionGate>

            <PermissionGate relationship={relationship} permission="view_equity_metrics">
              <div style={row}><span style={check}>✓</span><span>View system equity metrics</span></div>
            </PermissionGate>
          </div>
        </PlaybookCard>

        {((dashboard as LegacyValue).cards || (dashboard as LegacyValue).sections || ((dashboard as LegacyValue).actions || []).map((action: string) => ({ title: action, body: (dashboard as LegacyValue).insight, label: "Action" }))).map((card: LegacyValue) => (
          <PlaybookCard key={card.title} eyebrow={card.label || "Role OS"} title={card.title}>
            <p style={body}>{card.body || card.description || card.detail}</p>
            {card.status && <PlaybookPill>{card.status}</PlaybookPill>}
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

const row: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  color: "#0F172A",
  fontWeight: 800,
};

const check: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "#10B981",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 900,
  flexShrink: 0,
};

const callout: React.CSSProperties = {
  marginTop: 16,
  display: "grid",
  gap: 4,
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: 16,
  padding: 14,
  color: "#0F172A",
};
