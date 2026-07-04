"use client";

import {
  buildCoinLedgerEntry,
  buildRewardEvent,
  calculateRewardBalance,
  getRewardValue,
  type RewardEventType,
} from "@/lib/reward-events";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

const demoEvents: RewardEventType[] = [
  "course.completed",
  "evidence.verified",
  "portfolio.shared",
  "recommendation.approved",
  "application.ready",
];

export default function RewardEconomyDashboard() {
  const ledger = demoEvents.map((eventType) =>
    buildCoinLedgerEntry({
      scholarId: "scholar-maya",
      eventType,
    })
  );

  const balance = calculateRewardBalance(ledger);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Beta 3.4 Sprint II"
        title="Persistent Coin Ledger + Reward Events"
        subtitle="Playbook now has a platform-wide reward event model for courses, evidence, goals, messaging, applications, portfolios, recommendations, athlete readiness, and store redemptions."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Coins" value={String(balance.coins)} />
        <PlaybookMetric label="XP" value={String(balance.xp)} />
        <PlaybookMetric label="Reward Events" value={String(demoEvents.length)} />
      </PlaybookMetrics>

      <PlaybookGrid>
        {demoEvents.map((eventType) => {
          const value = getRewardValue(eventType);
          const event = buildRewardEvent({
            scholarId: "scholar-maya",
            eventType,
          });

          return (
            <PlaybookCard key={eventType} eyebrow="Reward Event" title={eventType.replaceAll(".", " ")}>
              <p style={body}>{value.reason}</p>
              <p style={body}>+{value.coins} coins · +{value.xp} XP</p>
              <PlaybookPill>{event.processed ? "processed" : "ready"}</PlaybookPill>
            </PlaybookCard>
          );
        })}
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
