"use client";

import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import {
  buildCompassNetworkRecommendations,
  getDemoNetworkIntelligence,
} from "@/lib/network-intelligence";

export default function NetworkIntelligenceDashboard() {
  const intelligence = getDemoNetworkIntelligence();

  const recommendations = buildCompassNetworkRecommendations({
    role: "scholar",
    intelligence,
  });

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Compass Network Intelligence"
        title="Playbook can reason across the support network."
        subtitle="Relationships, invitations, messages, and shared actions produce network health, blockers, and role-aware recommendations."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Network Health" value={`${intelligence.healthScore}%`} />
        <PlaybookMetric label="Relationships" value={String(intelligence.relationshipsCount)} />
        <PlaybookMetric label="Messages" value={String(intelligence.messagesCount)} />
        <PlaybookMetric label="Actions" value={String(intelligence.actionsCount)} />
      </PlaybookMetrics>

      <PlaybookGrid min={340}>
        <PlaybookCard eyebrow="Blockers" title="What is slowing momentum?">
          {intelligence.blockers.map((blocker, index) => (
            <div key={`${blocker.title}-${index}`} style={item}>
              <strong>{blocker.title}</strong>
              <p style={body}>{blocker.reason}</p>
              <PlaybookPill>{blocker.role}</PlaybookPill>
            </div>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Compass Recommendations" title="Next best network actions">
          {recommendations.map((rec) => (
            <div key={rec.title} style={item}>
              <strong>{rec.title}</strong>
              <p style={body}>{rec.action}</p>
              <PlaybookPill>{rec.priority}</PlaybookPill>
            </div>
          ))}
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const item: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
  color: "#0F172A",
};

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
